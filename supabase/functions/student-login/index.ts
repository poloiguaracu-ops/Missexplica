import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function allowedOrigin(req:Request): string | null {
  const origin=req.headers.get('Origin');
  const configured=(Deno.env.get('ALLOWED_ORIGINS')||'').split(',').map(x=>x.trim()).filter(Boolean);
  if(!origin) return configured[0]||null;
  if(configured.includes(origin)) return origin;
  return null;
}
function corsHeaders(req:Request){const origin=allowedOrigin(req);const headers:Record<string,string>={'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'};if(origin)headers['Access-Control-Allow-Origin']=origin;return headers;}
async function sha256(value:string){const bytes=new TextEncoder().encode(value);const hash=await crypto.subtle.digest('SHA-256',bytes);return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');}
Deno.serve(async req=>{
 const headers=corsHeaders(req);const origin=req.headers.get('Origin');
 if(origin&&!allowedOrigin(req))return new Response(JSON.stringify({error:'Origem não autorizada.'}),{status:403,headers:{...headers,'Content-Type':'application/json'}});
 if(req.method==='OPTIONS')return new Response('ok',{headers});
 try{
  if(req.method!=='POST')throw new Error('Método não permitido.');
  const {identifier,password}=await req.json();
  const raw=String(identifier||'').trim();const passwordValue=String(password||'');
  const isRu=/^MX\d{6,}$/i.test(raw);const cpfDigits=raw.replace(/\D/g,'');
  if((!isRu&&cpfDigits.length!==11)||passwordValue.length<1)throw new Error('CPF/RU ou senha inválidos.');
  const subjectValue=isRu?raw.toUpperCase():cpfDigits;
  const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const forwarded=req.headers.get('x-forwarded-for')||req.headers.get('x-real-ip')||'unknown';const ip=forwarded.split(',')[0].trim();
  const subjectHash=await sha256(`${isRu?'ru':'cpf'}:${subjectValue}`);const ipHash=await sha256(`ip:${ip}`);
  const {data:allowed,error:rateError}=await admin.rpc('check_login_rate_limit',{p_subject_hash:subjectHash,p_ip_hash:ipHash,p_window_seconds:900,p_max_attempts:8});
  if(rateError)throw new Error('Serviço de autenticação indisponível.');if(allowed!==true)throw new Error('Muitas tentativas. Aguarde alguns minutos e tente novamente.');
  const query=admin.from('profiles').select('id,email,full_name,role,active,cpf,ru').eq(isRu?'ru':'cpf',subjectValue).eq('role','student').eq('active',true).maybeSingle();
  const {data:profile,error:profileError}=await query;
  if(profileError||!profile||!profile.email)throw new Error('CPF/RU ou senha inválidos.');
  const authClient=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!);
  const {data:authData,error:authError}=await authClient.auth.signInWithPassword({email:profile.email,password:passwordValue});
  if(authError||!authData.session||!authData.user)throw new Error('CPF/RU ou senha inválidos.');
  return new Response(JSON.stringify({session:authData.session,name:profile.full_name,ru:profile.ru}),{status:200,headers:{...headers,'Content-Type':'application/json'}});
 }catch(e){const message=e instanceof Error?e.message:'Não foi possível entrar.';const status=message.startsWith('Muitas tentativas')?429:401;return new Response(JSON.stringify({error:message}),{status,headers:{...headers,'Content-Type':'application/json'}});}
});
