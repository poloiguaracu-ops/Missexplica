/* MissExplica V38 — recursos funcionais locais para Mensagens e Certificados */
(function(){
  'use strict';
  const D=document;
  const MSG_KEY='missexplica_messages_v1', CERT_KEY='missexplica_certificates_v1';
  const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[c]));
  const getState=()=>{try{return typeof state!=='undefined'?state:null}catch(e){return null}};
  const getMessages=()=>{try{return JSON.parse(localStorage.getItem(MSG_KEY)||'[]')}catch(e){return[]}};
  const saveMessages=m=>localStorage.setItem(MSG_KEY,JSON.stringify(m));
  function toast(msg){let el=D.getElementById('mx38-toast');if(!el){el=D.createElement('div');el.id='mx38-toast';Object.assign(el.style,{position:'fixed',right:'18px',bottom:'18px',zIndex:'10000',padding:'12px 15px',borderRadius:'13px',background:'#14251d',color:'#fff',font:'700 12px/1.3 Inter,system-ui,sans-serif',boxShadow:'0 14px 32px rgba(0,0,0,.18)'});D.body.appendChild(el)}el.textContent=msg;clearTimeout(el._t);el._t=setTimeout(()=>el.remove(),2600)}
  function messagesPage(force=false){
    const s=getState(); if(!s||s.page!=='messages') return false;
    const pc=D.getElementById('pageContent'); if(!pc) return false;
    if(!force&&pc.dataset.mx38Rendered==='messages') return false;
    pc.dataset.mx38Rendered='messages';
    let data=getMessages();
    if(!data.length){data=[{id:1,from:s.role==='student'?'Equipe MissExplica':'Aluno demonstrativo',subject:'Bem-vindo à MissExplica',body:'Este é o seu espaço de mensagens. As mensagens criadas neste navegador ficam salvas localmente.',date:new Date().toLocaleDateString('pt-BR'),read:false}];saveMessages(data)}
    pc.innerHTML=`<div class="welcome"><div><h1>Mensagens</h1><p>Central de comunicação da plataforma.</p></div><span class="badge">${data.filter(x=>!x.read).length} não lidas</span></div><div class="grid"><div class="panel"><div class="panel-head"><h3>Caixa de entrada</h3><button class="action" id="mx38ClearRead">Marcar todas como lidas</button></div><div id="mx38MessageList">${data.map(m=>`<article class="notice ${m.read?'':'success'}" data-msg="${m.id}" style="margin-bottom:10px"><div style="display:flex;justify-content:space-between;gap:12px"><strong>${esc(m.subject)}</strong><small>${esc(m.date)}</small></div><div style="font-size:11px;color:#6e7d76;margin:4px 0">De: ${esc(m.from)}</div><p style="margin:6px 0">${esc(m.body)}</p><div style="display:flex;gap:8px;justify-content:flex-end"><button class="action mx38-read" data-id="${m.id}">${m.read?'Lida':'Marcar como lida'}</button><button class="action mx38-delete" data-id="${m.id}">Excluir</button></div></article>`).join('')}</div></div><div class="panel"><h3>Nova mensagem</h3><label for="mx38To">Destinatário</label><input id="mx38To" placeholder="Nome ou e-mail"><label for="mx38Subject">Assunto</label><input id="mx38Subject" placeholder="Assunto"><label for="mx38Body">Mensagem</label><textarea id="mx38Body" rows="7" placeholder="Escreva sua mensagem..."></textarea><button class="green-btn" id="mx38Send">Enviar mensagem</button><div id="mx38MsgFeedback" class="notice success" hidden style="margin-top:10px"></div></div></div>`;
    D.querySelectorAll('.mx38-read').forEach(b=>b.onclick=()=>{let a=getMessages(),i=a.findIndex(x=>x.id==b.dataset.id);if(i>=0){a[i].read=true;saveMessages(a);messagesPage(true);}});
    D.querySelectorAll('.mx38-delete').forEach(b=>b.onclick=()=>{saveMessages(getMessages().filter(x=>x.id!=b.dataset.id));messagesPage(true);});
    const all=D.getElementById('mx38ClearRead');if(all)all.onclick=()=>{saveMessages(getMessages().map(x=>({...x,read:true})));messagesPage(true)};
    const send=D.getElementById('mx38Send');if(send)send.onclick=()=>{const to=D.getElementById('mx38To').value.trim(),subject=D.getElementById('mx38Subject').value.trim(),body=D.getElementById('mx38Body').value.trim();if(!to||!subject||!body){toast('Preencha destinatário, assunto e mensagem.');return}const a=getMessages();a.unshift({id:Date.now(),from:s.user||'Usuário',to,subject,body,date:new Date().toLocaleDateString('pt-BR'),read:true});saveMessages(a);toast('Mensagem salva neste dispositivo.');messagesPage(true)};
    return true;
  }
  function certificatesPage(force=false){
    const s=getState(); if(!s||s.role!=='student'||s.page!=='certificates')return false;
    const pc=D.getElementById('pageContent');if(!pc)return false;
    if(!force&&pc.dataset.mx38Rendered==='certificates')return false;
    pc.dataset.mx38Rendered='certificates';
    let progress={};try{progress=JSON.parse(localStorage.getItem('missexplica_course_progress_v1')||'{}')}catch(e){}
    const coursesLocal=[{name:'Introdução à Gestão',hours:20},{name:'Atendimento e Vendas',hours:15},{name:'Informática Essencial',hours:25},{name:'Comunicação Profissional',hours:12}];
    const completed=coursesLocal.filter(c=>progress[c.name]?.completed || c.name==='Informática Essencial');
    pc.innerHTML=`<div class="welcome"><div><h1>Meus certificados</h1><p>Seus cursos concluídos e certificados disponíveis.</p></div></div><div class="panel"><div class="panel-head"><h3>Certificados disponíveis</h3><span class="badge">${completed.length} concluído(s)</span></div>${completed.length?`<div class="course-list">${completed.map(c=>`<div class="course-card"><div class="course-cover">✓</div><div class="course-info"><strong>${esc(c.name)}</strong><span>Curso Livre • ${c.hours} horas • Concluído</span><small>Certificado disponível para emissão local.</small></div><button class="green-btn mx38Cert" data-course="${esc(c.name)}">Emitir</button></div>`).join('')}</div>`:'<div class="empty">Conclua um curso para que o certificado apareça aqui.</div>'}<div id="mx38CertFeedback" class="notice success" hidden style="margin-top:14px"></div></div>`;
    D.querySelectorAll('.mx38Cert').forEach(b=>b.onclick=()=>{const name=b.dataset.course;const a=JSON.parse(localStorage.getItem(CERT_KEY)||'[]');if(!a.some(x=>x.course===name))a.push({course:name,issuedAt:new Date().toISOString(),number:'MX-'+Date.now()});localStorage.setItem(CERT_KEY,JSON.stringify(a));const fb=D.getElementById('mx38CertFeedback');if(fb){fb.hidden=false;fb.textContent='Certificado registrado neste dispositivo. A emissão oficial integrada ao banco ainda não está conectada.'}});
    return true;
  }
  function enhance(){const s=getState();if(!s)return; if(messagesPage())return; if(certificatesPage())return;}
  function init(){const target=D.getElementById('pageContent')||D.body;new MutationObserver(()=>setTimeout(enhance,25)).observe(target,{childList:true,subtree:true});setTimeout(enhance,80)}
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
