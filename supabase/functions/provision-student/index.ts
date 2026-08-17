import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

function originHeaders(req:Request){const origin=req.headers.get('Origin');const allowed=(Deno.env.get('ALLOWED_ORIGINS')||'').split(',').map(x=>x.trim()).filter(Boolean);const headers:Record<string,string>={'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Vary':'Origin'};if(origin&&allowed.includes(origin))headers['Access-Control-Allow-Origin']=origin;return headers;}

Deno.serve(async req=>{
 const cors=originHeaders(req);const origin=req.headers.get('Origin');const allowed=(Deno.env.get('ALLOWED_ORIGINS')||'').split(',').map(x=>x.trim()).filter(Boolean);
 if(origin&&!allowed.includes(origin))return new Response(JSON.stringify({error:'Origem não autorizada.'}),{status:403,headers:{...cors,'Content-Type':'application/json'}});
 if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
 try{
  if(req.method!=='POST')throw new Error('Método não permitido.');
  const auth=req.headers.get('Authorization');if(!auth)throw new Error('Não autenticado.');
  const base=Deno.env.get('SUPABASE_URL')!;const anon=Deno.env.get('SUPABASE_ANON_KEY')!;const serviceRole=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  if(!base||!anon||!serviceRole)throw new Error('Serviço indisponível.');
  const caller=createClient(base,anon,{global:{headers:{Authorization:auth}}});const {data:{user:callerUser}}=await caller.auth.getUser();if(!callerUser)throw new Error('Não autenticado.');
  const admin=createClient(base,serviceRole);const {data:manager}=await admin.from('profiles').select('role,active').eq('id',callerUser.id).maybeSingle();if(!manager||manager.role!=='manager'||manager.active!==true)throw new Error('Apenas gestores podem liberar acesso.');

  const body=await req.json();
  const studentId=String(body?.studentId||'').trim();
  const fullName=String(body?.full_name||body?.fullName||'').trim();
  const email=String(body?.email||'').trim().toLowerCase();
  const cpf=String(body?.cpf||'').replace(/\D/g,'');
  const password=String(body?.password||'');
  if(password.length<8)throw new Error('A senha deve ter pelo menos 8 caracteres.');

  if(studentId){
   const {data:profile,error:pe}=await admin.from('profiles').select('id,full_name,cpf,ru,role,active').eq('id',studentId).maybeSingle();
   if(pe||!profile||profile.role!=='student'||profile.active!==true||!profile.cpf)throw new Error('Aluno sem cadastro completo.');
   const {data:authUser,error:authUserError}=await admin.auth.admin.getUserById(profile.id);if(authUserError||!authUser?.user?.email)throw new Error('Aluno sem conta de autenticação.');
   const {error:ue}=await admin.auth.admin.updateUserById(profile.id,{password,email_confirm:true,user_metadata:{full_name:profile.full_name,ru:profile.ru||null}});if(ue)throw ue;
   return new Response(JSON.stringify({ok:true,created:false,studentId:profile.id,ru:profile.ru,cpf:profile.cpf,email:authUser.user.email,name:profile.full_name,login:'CPF ou RU + senha'}),{status:200,headers:{...cors,'Content-Type':'application/json'}});
  }

  if(!fullName||!email||cpf.length!==11)throw new Error('Nome, e-mail e CPF são obrigatórios.');
  const {data:existingProfile}=await admin.from('profiles').select('id,ru,full_name').eq('cpf',cpf).maybeSingle();
  if(existingProfile)throw new Error('Já existe um aluno cadastrado com este CPF.');
  const {data:authData,error:createError}=await admin.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name:fullName}});
  if(createError||!authData.user)throw createError||new Error('Não foi possível criar a conta de autenticação.');
  const {error:profileError}=await admin.from('profiles').insert({id:authData.user.id,full_name:fullName,role:'student',active:true,cpf});
  if(profileError){await admin.auth.admin.deleteUser(authData.user.id);throw profileError;}
  return new Response(JSON.stringify({ok:true,created:true,studentId:authData.user.id,ru:null,cpf,email:authData.user.email,name:fullName,login:'CPF ou RU + senha',next:'Matricule o aluno para gerar o RU automaticamente.'}),{status:200,headers:{...cors,'Content-Type':'application/json'}});
 }catch(e){return new Response(JSON.stringify({error:e instanceof Error?e.message:'Não foi possível liberar o acesso.'}),{status:400,headers:{...cors,'Content-Type':'application/json'}});}
});
