/* MissExplica — login acadêmico do aluno por CPF + RU. */
(function(){
  const $=id=>document.getElementById(id);
  const normalizeCpf=v=>String(v||'').replace(/\D/g,'');
  function mount(){
    const card=document.querySelector('.login-card'); if(!card||$('studentRuForm')) return;
    const google=$('googleLogin'), divider=card.querySelector('.login-divider'), oldForm=$('loginForm');
    oldForm?.classList.add('hidden'); divider?.classList.add('hidden');
    const box=document.createElement('div');
    box.innerHTML=`<form id="studentRuForm" class="student-ru-form"><div class="ru-access-note"><strong>Acesso do aluno</strong><span>Entre usando seu CPF e o RU gerado no momento da matrícula.</span></div><label for="studentCpf">CPF</label><input id="studentCpf" inputmode="numeric" autocomplete="username" placeholder="000.000.000-00" maxlength="14" required><label for="studentRu">RU</label><input id="studentRu" autocomplete="one-time-code" placeholder="MX100001" maxlength="30" required><button class="green-btn primary-btn" type="submit">Entrar no AVA</button><div id="studentRuMessage" class="demo-box hidden"></div></form>`;
    google?.after(box);
    $('studentCpf').addEventListener('input',e=>{let v=normalizeCpf(e.target.value).slice(0,11);if(v.length>9)e.target.value=v.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/,'$1.$2.$3-$4');else if(v.length>6)e.target.value=v.replace(/(\d{3})(\d{3})(\d{0,3})/,'$1.$2.$3');else if(v.length>3)e.target.value=v.replace(/(\d{3})(\d{0,3})/,'$1.$2');else e.target.value=v;});
    $('studentRu').addEventListener('input',e=>e.target.value=e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,30));
    $('studentRuForm').addEventListener('submit',async e=>{
      e.preventDefault(); const btn=e.currentTarget.querySelector('button[type="submit"]'),msg=$('studentRuMessage'); btn.disabled=true;btn.textContent='Verificando...';msg.classList.remove('hidden');msg.innerHTML='<strong>Aguarde</strong><span>Validando seu CPF e RU.</span>';
      try{
        const cfg=window.MISSEXPLICA_SUPABASE;
        if(!cfg?.url||!cfg?.anonKey)throw new Error('Supabase ainda não configurado.');
        const r=await fetch(`${cfg.url}/functions/v1/student-login`,{method:'POST',headers:{'Content-Type':'application/json','apikey':cfg.anonKey},body:JSON.stringify({cpf:$('studentCpf').value,ru:$('studentRu').value})});
        const data=await r.json(); if(!r.ok||!data.action_link)throw new Error(data.error||'CPF ou RU inválidos.');
        location.href=data.action_link;
      }catch(err){msg.innerHTML=`<strong>Não foi possível entrar</strong><span>${String(err.message||'CPF ou RU inválidos.')}</span>`;btn.disabled=false;btn.textContent='Entrar no AVA';}
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
