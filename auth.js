/* MissExplica — autenticação real com Supabase Auth + Google OAuth. */
(function(){
  const cfg=window.MISSEXPLICA_SUPABASE;
  const configured=!!(cfg?.url&&cfg?.anonKey&&!cfg.url.includes('SEU-PROJETO')&&!cfg.anonKey.includes('SUA_ANON'));
  const $=id=>document.getElementById(id);
  const message=(title,text,error=false)=>{const el=$('loginMessage');if(el){el.innerHTML=`<strong>${title}</strong><span>${text}</span>`;el.dataset.error=error?'true':'false';el.classList.remove('hidden')}};
  function reset(btn){if(btn){btn.disabled=false;btn.textContent='Entrar'}}
  function clear(){['missexplica_auth','missexplica_role','missexplica_name'].forEach(k=>localStorage.removeItem(k))}
  if(!configured){
    document.addEventListener('DOMContentLoaded',()=>{
      message('Configuração pendente','O login Google e o login por e-mail estão prontos, mas é necessário preencher a URL e a anon/public key do seu projeto Supabase em supabase-config.js.',false);
      const g=$('googleLogin');if(g)g.disabled=true;
    });return;
  }
  const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';s.onload=()=>boot(window.supabase.createClient(cfg.url,cfg.anonKey));s.onerror=()=>message('Serviço indisponível','Não foi possível carregar o serviço de autenticação. Tente novamente.',true);document.head.appendChild(s);
  function boot(client){
    window.missexplicaSupabase=client;
    const google=$('googleLogin'),form=$('loginForm'),forgot=$('forgotPassword');
    google?.addEventListener('click',async()=>{google.disabled=true;google.innerHTML='<span>G</span><strong>Conectando...</strong>';const {error}=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname}});if(error){message('Não foi possível entrar',error.message,true);google.disabled=false;google.innerHTML='<span>G</span><strong>Continuar com Google</strong>';}});
    form?.addEventListener('submit',async e=>{e.preventDefault();e.stopImmediatePropagation();const email=$('email').value.trim(),password=$('password').value,btn=form.querySelector('button[type="submit"]');if(!email||!password)return;btn.disabled=true;btn.textContent='Entrando...';message('Verificando acesso','Estamos conferindo sua conta...');const {data,error}=await client.auth.signInWithPassword({email,password});if(error){message('Não foi possível entrar',error.message==='Invalid login credentials'?'E-mail ou senha incorretos.':error.message,true);reset(btn);return}await finish(client,data.user,btn);},true);
    forgot?.addEventListener('click',async()=>{const email=$('email').value.trim();if(!email){message('Informe seu e-mail','Digite seu e-mail acima para receber o link de recuperação.',true);$('email').focus();return}forgot.disabled=true;const {error}=await client.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname+'?reset=1'});forgot.disabled=false;if(error)message('Não foi possível enviar',error.message,true);else message('E-mail enviado','Se essa conta existir, você receberá um link para redefinir a senha.',false)});
    client.auth.onAuthStateChange(async(event,session)=>{if(event==='SIGNED_OUT'){clear();return}if(event==='SIGNED_IN'&&session)await finish(client,session.user)});
    client.auth.getSession().then(({data})=>{if(data.session)finish(client,data.session.user)});
  }
  async function finish(client,user,btn){
    if(!user)return;
    const {data:profile,error}=await client.from('profiles').select('id,full_name,role,status').eq('id',user.id).maybeSingle();
    if(error){message('Perfil indisponível','Sua conta foi autenticada, mas o perfil MissExplica não pôde ser carregado.',true);await client.auth.signOut();reset(btn);return}
    if(!profile){message('Acesso ainda não liberado','Sua conta Google foi reconhecida, mas não existe um cadastro ativo na MissExplica. Peça ao gestor para liberar seu acesso.',true);await client.auth.signOut();reset(btn);return}
    if(profile.status&&profile.status!=='active'){message('Acesso bloqueado','Sua conta está bloqueada. Entre em contato com a gestão da MissExplica.',true);await client.auth.signOut();reset(btn);return}
    localStorage.setItem('missexplica_auth','true');localStorage.setItem('missexplica_role',profile.role);localStorage.setItem('missexplica_name',profile.full_name||user.user_metadata?.full_name||user.email?.split('@')[0]||'Usuário');location.reload();
  }
})();
