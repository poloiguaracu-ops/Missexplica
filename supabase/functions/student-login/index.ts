import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function allowedOrigin(req:Request): string | null {
  const origin=req.headers.get('Origin');
  const configured=(Deno.env.get('ALLOWED_ORIGINS')||'').split(',').map(x=>x.trim()).filter(Boolean);
  if(!origin) return configured[0]||null;
  if(configured.includes(origin)) return origin;
  return null;
}

function corsHeaders(req:Request){
  const origin=allowedOrigin(req);
  const headers:Record<string,string>={
    'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods':'POST, OPTIONS',
    'Vary':'Origin'
  };
  if(origin) headers['Access-Control-Allow-Origin']=origin;
  return headers;
}

async function sha256(value:string){
  const bytes=new TextEncoder().encode(value);
  const hash=await crypto.subtle.digest('SHA-256',bytes);
  return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

Deno.serve(async req=>{
  const headers=corsHeaders(req);
  const origin=req.headers.get('Origin');
  if(origin&&!allowedOrigin(req)) return new Response(JSON.stringify({error:'Origem não autorizada.'}),{status:403,headers:{...headers,'Content-Type':'application/json'}});
  if(req.method==='OPTIONS') return new Response('ok',{headers});
  try{
    if(req.method!=='POST') throw new Error('Método não permitido.');
    const {cpf,ru}=await req.json();
    const cpfDigits=String(cpf||'').replace(/\D/g,'');
    const ruValue=String(ru||'').trim().toUpperCase();
    if(cpfDigits.length!==11||!/^MX\d{6,}$/.test(ruValue)) throw new Error('Credenciais inválidas.');

    const admin=createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const forwarded=req.headers.get('x-forwarded-for')||req.headers.get('x-real-ip')||'unknown';
    const ip=forwarded.split(',')[0].trim();
    const subjectHash=await sha256(`cpf:${cpfDigits}`);
    const ipHash=await sha256(`ip:${ip}`);
    const {data:allowed,error:rateError}=await admin.rpc('check_login_rate_limit',{p_subject_hash:subjectHash,p_ip_hash:ipHash,p_window_seconds:900,p_max_attempts:8});
    if(rateError) throw new Error('Serviço de autenticação indisponível.');
    if(allowed!==true) throw new Error('Muitas tentativas. Aguarde alguns minutos e tente novamente.');

    const {data:profile,error:profileError}=await admin
      .from('profiles')
      .select('id,email,full_name,role,active,cpf,ru')
      .eq('cpf',cpfDigits)
      .eq('ru',ruValue)
      .maybeSingle();

    if(profileError||!profile||profile.role!=='student'||profile.active!==true||!profile.email){
      throw new Error('Credenciais inválidas.');
    }

    const {data:linkData,error:linkError}=await admin.auth.admin.generateLink({
      type:'magiclink',
      email:profile.email,
      options:{redirectTo:Deno.env.get('STUDENT_LOGIN_REDIRECT')||undefined}
    });

    const actionLink=linkData?.properties?.action_link;
    if(linkError||!actionLink) throw new Error('Não foi possível criar a sessão.');

    return new Response(JSON.stringify({action_link:actionLink,name:profile.full_name,ru:profile.ru}),{status:200,headers:{...headers,'Content-Type':'application/json'}});
  }catch(e){
    const message=e instanceof Error?e.message:'Não foi possível entrar.';
    const status=message.startsWith('Muitas tentativas')?429:401;
    return new Response(JSON.stringify({error:message}),{status,headers:{...headers,'Content-Type':'application/json'}});
  }
});
