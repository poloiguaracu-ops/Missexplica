/* MissExplica — restaura e observa somente a sessão Supabase.
   O login do aluno é exclusivamente CPF ou RU + senha, tratado por student-credentials.js. */
(function(){
  const cfg=window.MISSEXPLICA_SUPABASE;
  const configured=!!(cfg?.url&&cfg?.anonKey&&!cfg.url.includes('SEU-PROJETO')&&!cfg.anonKey.includes('SUA_ANON'));
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
  if(!configured)return;
  const s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  s.onload=()=>boot(window.supabase.createClient(cfg.url,cfg.anonKey));
  s.onerror=()=>console.error('[MissExplica] Não foi possível carregar Supabase.');
  document.head.appendChild(s);

  async function boot(client){
    window.missexplicaSupabase=client;
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
