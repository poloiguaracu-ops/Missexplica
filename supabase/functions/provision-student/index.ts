import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const cors={
 'Access-Control-Allow-Origin':'*',
 'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
 'Access-Control-Allow-Methods':'POST, OPTIONS'
};

Deno.serve(async req=>{
 if(req.method==='OPTIONS') return new Response('ok',{headers:cors});
 try{
  const auth=req.headers.get('Authorization');
  if(!auth) throw new Error('Não autenticado.');
  const base=Deno.env.get('SUPABASE_URL')!;
  const anon=Deno.env.get('SUPABASE_ANON_KEY')!;
  const adminKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const caller=createClient(base,anon,{global:{headers:{Authorization:auth}}});
  const {data:{user:callerUser}}=await caller.auth.getUser();
  if(!callerUser) throw new Error('Não autenticado.');
  const admin=createClient(base,adminKey);
  const {data:manager}=await admin.from('profiles').select('role,active').eq('id',callerUser.id).maybeSingle();
  if(!manager||manager.role!=='manager'||manager.active!==true) throw new Error('Apenas gestores podem liberar acesso.');
  const {studentId}=await req.json();
  if(!studentId) throw new Error('Aluno inválido.');
  const {data:profile,error:pe}=await admin.from('profiles').select('id,email,full_name,cpf,ru,role,active').eq('id',studentId).maybeSingle();
  if(pe||!profile||profile.role!=='student'||profile.active!==true||!profile.email||!profile.ru) throw new Error('Aluno sem cadastro completo.');
  const password=profile.ru;
  const {error:ue}=await admin.auth.admin.updateUserById(profile.id,{password,email_confirm:true,user_metadata:{full_name:profile.full_name,ru:profile.ru}});
  if(ue) throw ue;
  return new Response(JSON.stringify({ok:true,ru:profile.ru,email:profile.email,name:profile.full_name}),{status:200,headers:{...cors,'Content-Type':'application/json'}});
 }catch(e){
  return new Response(JSON.stringify({error:e?.message||'Não foi possível liberar o acesso.'}),{status:400,headers:{...cors,'Content-Type':'application/json'}});
 }
});
