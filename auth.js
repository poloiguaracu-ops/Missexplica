/* Autenticação real da MissExplica com Supabase Auth.
   Este arquivo não contém senha, service_role key ou credenciais privadas. */
(function(){
  const cfg=window.MISSEXPLICA_SUPABASE;
  const configured=cfg && cfg.url && cfg.anonKey && !cfg.url.includes('SEU-PROJETO') && !cfg.anonKey.includes('SUA_ANON');
  const $=id=>document.getElementById(id);
  const msg=(text,error=false)=>{const el=$('loginMessage');if(el){el.innerHTML=`<strong>${error?'Não foi possível entrar':'MissExplica'}</strong><span>${text}</span>`;el.classList.remove('hidden')}};
  if(!configured){
    document.addEventListener('DOMContentLoaded',()=>msg('A autenticação real está preparada, mas ainda falta colocar a URL e a anon/public key do Supabase em supabase-config.js.',false));
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
    if(!form)return;
    form.addEventListener('submit',async ev=>{
      ev.preventDefault();ev.stopImmediatePropagation();
      const email=$('email').value.trim();const password=$('password').value;const requestedRole=$('loginRole').value;
      if(!email||!password)return;
      const btn=form.querySelector('button[type="submit"]');if(btn){btn.disabled=true;btn.textContent='Entrando...'}
      msg('Verificando sua conta...');
      const {data,error}=await client.auth.signInWithPassword({email,password});
      if(error){msg(error.message==='Invalid login credentials'?'E-mail ou senha incorretos.':error.message,true);if(btn){btn.disabled=false;btn.textContent='Entrar no ambiente'};return;}
      const user=data.user;
      const {data:profile,error:profileError}=await client.from('profiles').select('id,full_name,role,status').eq('id',user.id).maybeSingle();
      if(profileError){msg('Sua conta entrou, mas não foi possível carregar seu perfil.',true);await client.auth.signOut();if(btn){btn.disabled=false;btn.textContent='Entrar no ambiente'};return;}
      if(!profile){msg('Sua conta ainda não possui um perfil na MissExplica. Peça ao gestor para cadastrá-lo.',true);await client.auth.signOut();if(btn){btn.disabled=false;btn.textContent='Entrar no ambiente'};return;}
      if(profile.status && profile.status!=='active'){msg('Seu acesso está bloqueado. Procure o gestor da MissExplica.',true);await client.auth.signOut();if(btn){btn.disabled=false;btn.textContent='Entrar no ambiente'};return;}
      if(requestedRole!==profile.role){msg('O perfil selecionado não corresponde ao seu cadastro. Selecione o perfil correto.',true);await client.auth.signOut();if(btn){btn.disabled=false;btn.textContent='Entrar no ambiente'};return;}
      localStorage.setItem('missexplica_auth','true');localStorage.setItem('missexplica_role',profile.role);localStorage.setItem('missexplica_name',profile.full_name||email.split('@')[0]);
      location.reload();
    },true);
    client.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'){localStorage.removeItem('missexplica_auth');localStorage.removeItem('missexplica_role');localStorage.removeItem('missexplica_name')}});
    restoreSession(client);
  }
  async function restoreSession(client){
    const {data}=await client.auth.getSession();
    if(!data.session)return;
    const {data:profile}=await client.from('profiles').select('full_name,role,status').eq('id',data.session.user.id).maybeSingle();
    if(profile && profile.status==='active'){localStorage.setItem('missexplica_auth','true');localStorage.setItem('missexplica_role',profile.role);localStorage.setItem('missexplica_name',profile.full_name||data.session.user.email.split('@')[0]);}
  }
})();
