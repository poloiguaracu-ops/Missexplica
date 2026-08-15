/* Autenticação MissExplica: e-mail/senha + Google OAuth via Supabase Auth. */
(function(){
  const cfg=window.MISSEXPLICA_SUPABASE;
  const configured=cfg && cfg.url && cfg.anonKey && !cfg.url.includes('SEU-PROJETO') && !cfg.anonKey.includes('SUA_ANON');
  const $=id=>document.getElementById(id);
  const msg=(text,error=false)=>{const el=$('loginMessage');if(el){el.innerHTML=`<strong>${error?'Não foi possível entrar':'MissExplica'}</strong><span>${text}</span>`;el.classList.remove('hidden')}};
  if(!configured){
    document.addEventListener('DOMContentLoaded',()=>{
      msg('O login real está pronto para o Supabase. Falta apenas configurar a URL e a anon/public key em supabase-config.js. O botão Google será habilitado automaticamente depois disso.',false);
      const google=$('googleLogin'); if(google) google.disabled=true;
    });
    return;
  }
  const script=document.createElement('script');
  script.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  script.onload=()=>boot(window.supabase.createClient(cfg.url,cfg.anonKey));
  script.onerror=()=>msg('Não foi possível carregar o serviço de autenticação.',true);
  document.head.appendChild(script);
  function boot(client){
    window.missexplicaSupabase=client;
    const form=$('loginForm');
    const google=$('googleLogin');
    if(google) google.addEventListener('click',async()=>{
      google.disabled=true;google.innerHTML='<span>G</span><strong>Conectando ao Google...</strong>';
      const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin+window.location.pathname}});
      if(error){msg(error.message,true);google.disabled=false;google.innerHTML='<span>G</span><strong>Continuar com Google</strong>';}
    });
    if(form) form.addEventListener('submit',async ev=>{
      ev.preventDefault();ev.stopImmediatePropagation();
      const email=$('email').value.trim();const password=$('password').value;
      if(!email||!password)return;
      const btn=form.querySelector('button[type="submit"]');if(btn){btn.disabled=true;btn.textContent='Entrando...'}
      msg('Verificando sua conta...');
      const {data,error}=await client.auth.signInWithPassword({email,password});
      if(error){msg(error.message==='Invalid login credentials'?'E-mail ou senha incorretos.':error.message,true);resetButton(btn);return;}
      await finishLogin(client,data.user,resetButton.bind(null,btn));
    },true);
    client.auth.onAuthStateChange(async(event,session)=>{
      if(event==='SIGNED_OUT'){clearLocal();return;}
      if((event==='SIGNED_IN'||event==='INITIAL_SESSION')&&session) await finishLogin(client,session.user);
    });
    restoreSession(client);
  }
  async function finishLogin(client,user,reset){
    if(!user)return;
    const {data:profile,error}=await client.from('profiles').select('id,full_name,role,status').eq('id',user.id).maybeSingle();
    if(error){msg('Sua conta foi autenticada, mas o perfil não pôde ser carregado.',true);await client.auth.signOut();if(reset)reset();return;}
    if(!profile){msg('Sua conta Google foi reconhecida, mas ainda não possui cadastro na MissExplica. Peça ao gestor para liberar seu acesso.',true);await client.auth.signOut();if(reset)reset();return;}
    if(profile.status && profile.status!=='active'){msg('Seu acesso está bloqueado. Procure o gestor da MissExplica.',true);await client.auth.signOut();if(reset)reset();return;}
    localStorage.setItem('missexplica_auth','true');localStorage.setItem('missexplica_role',profile.role);localStorage.setItem('missexplica_name',profile.full_name||user.user_metadata?.full_name||user.email?.split('@')[0]||'Usuário');
    location.reload();
  }
  async function restoreSession(client){const {data}=await client.auth.getSession();if(data.session)await finishLogin(client,data.session.user)}
  function resetButton(btn){if(btn){btn.disabled=false;btn.textContent='Entrar'}}
  function clearLocal(){localStorage.removeItem('missexplica_auth');localStorage.removeItem('missexplica_role');localStorage.removeItem('missexplica_name')}
})();
