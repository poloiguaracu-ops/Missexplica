import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function originHeaders(req:Request){const origin=req.headers.get('Origin');const allowed=(Deno.env.get('ALLOWED_ORIGINS')||'').split(',').map(x=>x.trim()).filter(Boolean);const headers:Record<string,string>={'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'};if(origin&&allowed.includes(origin))headers['Access-Control-Allow-Origin']=origin;return headers;}
Deno.serve(async req=>{
 const cors=originHeaders(req);const origin=req.headers.get('Origin');const allowed=(Deno.env.get('ALLOWED_ORIGINS')||'').split(',').map(x=>x.trim()).filter(Boolean);if(origin&&!allowed.includes(origin))return new Response(JSON.stringify({error:'Origem não autorizada.'}),{status:403,headers:{...cors,'Content-Type':'application/json'}});
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 try{
  if(req.method!=='POST')throw new Error('Método não permitido.');
  const auth=req.headers.get('Authorization');if(!auth)throw new Error('Não autenticado.');
  const base=Deno.env.get('SUPABASE_URL')!;const anon=Deno.env.get('SUPABASE_ANON_KEY')!;const adminKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const caller=createClient(base,anon,{global:{headers:{Authorization:auth}}});const {data:{user:callerUser}}=await caller.auth.getUser();if(!callerUser)throw new Error('Não autenticado.');
  const admin=createClient(base,adminKey);const {data:manager}=await admin.from('profiles').select('role,active').eq('id',callerUser.id).maybeSingle();if(!manager||manager.role!=='manager'||manager.active!==true)throw new Error('Apenas gestores podem liberar acesso.');
  const {studentId,password}=await req.json();if(!studentId)throw new Error('Aluno inválido.');const passwordValue=String(password||'');if(passwordValue.length<8)throw new Error('A senha deve ter pelo menos 8 caracteres.');
  const {data:profile,error:pe}=await admin.from('profiles').select('id,email,full_name,cpf,ru,role,active').eq('id',studentId).maybeSingle();if(pe||!profile||profile.role!=='student'||profile.active!==true||!profile.email||!profile.ru||!profile.cpf)throw new Error('Aluno sem cadastro completo.');
  const {error:ue}=await admin.auth.admin.updateUserById(profile.id,{password:passwordValue,email_confirm:true,user_metadata:{full_name:profile.full_name,ru:profile.ru}});if(ue)throw ue;
  return new Response(JSON.stringify({ok:true,ru:profile.ru,cpf:profile.cpf,email:profile.email,name:profile.full_name,login:'CPF ou RU + senha'}),{status:200,headers:{...cors,'Content-Type':'application/json'}});
 }catch(e){return new Response(JSON.stringify({error:e instanceof Error?e.message:'Não foi possível liberar o acesso.'}),{status:400,headers:{...cors,'Content-Type':'application/json'}});}
});
