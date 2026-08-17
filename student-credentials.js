/* MissExplica — login do aluno por CPF ou RU + senha. */
(function(){
 const $=id=>document.getElementById(id);
 const cleanCpf=v=>String(v||'').replace(/\D/g,'').slice(0,11);
 const looksCpf=v=>cleanCpf(v).length===11;
 const normalizeIdentifier=v=>{const raw=String(v||'').trim();return /^MX\d{6,}$/i.test(raw)?raw.toUpperCase():cleanCpf(raw)};
 function message(text,error=true){const el=$('studentLoginMessage');if(!el)return;el.innerHTML=`<strong>${error?'Não foi possível entrar':'Acesso liberado'}</strong><span>${text}</span>`;el.classList.remove('hidden')}
 function mount(){
  const form=$('studentRuLoginForm');if(!form)return;
  const identifier=$('studentIdentifier'),password=$('studentPassword'),btn=form.querySelector('button[type="submit"]'),toggle=$('toggleStudentPassword');
  toggle?.addEventListener('click',()=>{const visible=password.type==='text';password.type=visible?'password':'text';toggle.textContent=visible?'Mostrar':'Ocultar'});
  identifier?.addEventListener('input',()=>{const v=identifier.value.trim();if(!/^MX\d{6,}$/i.test(v)&&/^[0-9.\-\s]+$/.test(v))identifier.value=v.replace(/\D/g,'').slice(0,11)});
  form.addEventListener('submit',async e=>{
   e.preventDefault();
   const rawIdentifier=identifier.value.trim(),identifierValue=normalizeIdentifier(rawIdentifier),passwordValue=password.value;
   const valid=(looksCpf(rawIdentifier)||/^MX\d{6,}$/.test(identifierValue));
   if(!valid||passwordValue.length<1){message('Informe seu CPF ou RU e sua senha.');return}
   btn.disabled=true;btn.textContent='Entrando...';
   const cfg=window.MISSEXPLICA_SUPABASE;
   if(!cfg?.url||!cfg?.anonKey||cfg.url.includes('SEU-PROJETO')||cfg.anonKey.includes('SUA_ANON')){message('O serviço de autenticação ainda não foi configurado.');btn.disabled=false;btn.textContent='Entrar no AVA';return}
   try{
    const r=await fetch(`${cfg.url}/functions/v1/student-login`,{method:'POST',headers:{'Content-Type':'application/json','apikey':cfg.anonKey},body:JSON.stringify({identifier:identifierValue,password:passwordValue})});
    const data=await r.json();
    if(!r.ok||!data.session?.access_token||!data.session?.refresh_token)throw new Error(data.error||'CPF/RU ou senha inválidos.');
    const client=window.missexplicaSupabase;
    if(!client)throw new Error('Sessão não configurada.');
    const {error:sessionError}=await client.auth.setSession({access_token:data.session.access_token,refresh_token:data.session.refresh_token});
    if(sessionError)throw sessionError;
    localStorage.setItem('missexplica_ru',data.ru||'');localStorage.setItem('missexplica_name',data.name||'Aluno');
    message('Login realizado. Abrindo seu ambiente de estudos...',false);
   }catch(err){message(err.message||'CPF/RU ou senha inválidos.');btn.disabled=false;btn.textContent='Entrar no AVA'}
  });
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
