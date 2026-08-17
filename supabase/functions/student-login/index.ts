import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods':'POST, OPTIONS'
};

Deno.serve(async req=>{
  if(req.method==='OPTIONS') return new Response('ok',{headers:cors});
  try{
    const {cpf,ru}=await req.json();
    const cpfDigits=String(cpf||'').replace(/\D/g,'');
    const ruValue=String(ru||'').trim().toUpperCase();
    if(cpfDigits.length!==11||!/^MX\d{6,}$/.test(ruValue)) throw new Error('Credenciais inválidas.');

    const admin=createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

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

    return new Response(JSON.stringify({
      action_link:actionLink,
      name:profile.full_name,
      ru:profile.ru
    }),{status:200,headers:{...cors,'Content-Type':'application/json'}});
  }catch(e){
    return new Response(JSON.stringify({error:'CPF ou RU inválidos.'}),{status:401,headers:{...cors,'Content-Type':'application/json'}});
  }
});
