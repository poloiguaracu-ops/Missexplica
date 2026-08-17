/* MissExplica — sessão Supabase para o AVA.
   O login do aluno é CPF ou RU + senha, tratado por student-credentials.js. */
(function(){
  const cfg=window.MISSEXPLICA_SUPABASE;
  const configured=!!(cfg?.url&&cfg?.anonKey&&!cfg.url.includes('SEU-PROJETO')&&!cfg.anonKey.includes('SUA_ANON'));
  let resolveReady,rejectReady;
  window.missexplicaSupabaseReady=new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject});
  const clearCache=()=>['missexplica_auth','missexplica_role','missexplica_name'].forEach(k=>localStorage.removeItem(k));
  const enterPlatform=(profile,user)=>{
    localStorage.setItem('missexplica_auth','true');
    localStorage.setItem('missexplica_role',profile?.role||'student');
    localStorage.setItem('missexplica_name',profile?.full_name||user?.user_metadata?.full_name||localStorage.getItem('missexplica_name')||'Aluno');
    document.getElementById('loginScreen')?.classList.add('hidden');
    document.getElementById('platform')?.classList.remove('hidden');
    if(typeof window.render==='function')window.render();
    window.dispatchEvent(new CustomEvent('missexplica:auth-ready'));
  };
  function logoutToLogin(){clearCache();document.getElementById('platform')?.classList.add('hidden');document.getElementById('loginScreen')?.classList.remove('hidden')}
  if(!configured){rejectReady(new Error('Supabase não configurado.'));return;}
  const s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  s.onload=()=>{try{boot(window.supabase.createClient(cfg.url,cfg.anonKey))}catch(e){rejectReady(e)}};
  s.onerror=()=>{const e=new Error('Não foi possível carregar Supabase.');rejectReady(e);console.error('[MissExplica]',e.message)};
  document.head.appendChild(s);

  async function boot(client){
    window.missexplicaSupabase=client;
    resolveReady(client);
    client.auth.onAuthStateChange(async(event,session)=>{
      if(event==='SIGNED_OUT'||!session){logoutToLogin();return}
      if(['SIGNED_IN','TOKEN_REFRESHED','USER_UPDATED'].includes(event))await loadProfile(client,session.user);
    });
    const {data}=await client.auth.getSession();
    if(data.session)await loadProfile(client,data.session.user); else logoutToLogin();
  }
  async function loadProfile(client,user){
    const {data:profile,error}=await client.from('profiles').select('id,full_name,role,active').eq('id',user.id).maybeSingle();
    if(error||!profile||profile.active!==true){await client.auth.signOut();return}
    enterPlatform(profile,user);
  }
})();
