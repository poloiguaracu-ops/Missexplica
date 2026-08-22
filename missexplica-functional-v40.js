/* MissExplica V40 — fluxos funcionais locais para professor e gestor */
(function(){
  'use strict';
  const D=document;
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??f}catch{return f}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const getState=()=>{try{return typeof state!=='undefined'?state:null}catch{return null}};
  const toast=msg=>{let e=D.getElementById('mx40-toast');if(!e){e=D.createElement('div');e.id='mx40-toast';Object.assign(e.style,{position:'fixed',right:'18px',bottom:'18px',zIndex:10001,padding:'12px 15px',borderRadius:'13px',background:'#14251d',color:'#fff',font:'700 12px/1.35 Inter,system-ui,sans-serif',boxShadow:'0 14px 32px rgba(0,0,0,.18)'});D.body.appendChild(e)}e.textContent=msg;clearTimeout(e._t);e._t=setTimeout(()=>e.remove(),2500)};
  function teacherContentEnhance(){
    const s=getState(); if(!s||s.role!=='teacher'||s.page!=='content')return false;
    const pc=D.getElementById('pageContent'); if(!pc||pc.dataset.mx40Content==='1')return false; pc.dataset.mx40Content='1';
    const key='missexplica_teacher_lessons_v1'; let lessons=read(key,[]);
    const list=pc.querySelector('.course-list'); if(list&&lessons.length){
      list.insertAdjacentHTML('afterbegin',lessons.map((l,i)=>`<div class="course-card" data-local-lesson="${i}"><div class="course-cover">L${String(i+1).padStart(2,'0')}</div><div class="course-info"><strong>${esc(l.title)}</strong><span>${esc(l.module)} • ${l.status}</span><small>${esc(l.description||'Sem descrição')}</small></div><button class="action mx40-delete" data-id="${i}">Excluir</button></div>`).join(''));
      pc.querySelectorAll('.mx40-delete').forEach(b=>b.onclick=()=>{lessons.splice(+b.dataset.id,1);write(key,lessons);toast('Aula removida deste dispositivo.');location.reload()});
    }
    const save=D.getElementById('saveLesson'),publish=D.getElementById('publishLesson');
    function collect(status){const title=D.getElementById('lessonTitleInput')?.value.trim(),module=D.getElementById('moduleInput')?.value||'',description=D.getElementById('lessonDescription')?.value.trim()||'',video=D.getElementById('videoUrl')?.value.trim()||'';if(!title){toast('Informe o título da aula.');return null}return {title,module,description,video,status,updatedAt:new Date().toISOString()}}
    if(save&&!save.dataset.mx40Bound){save.dataset.mx40Bound='1';save.addEventListener('click',()=>{const x=collect('Rascunho');if(!x)return;lessons.push(x);write(key,lessons);toast('Rascunho salvo neste dispositivo.');setTimeout(()=>location.reload(),100)})}
    if(publish&&!publish.dataset.mx40Bound){publish.dataset.mx40Bound='1';publish.addEventListener('click',()=>{const x=collect('Publicado localmente');if(!x)return;lessons.push(x);write(key,lessons);toast('Aula publicada localmente.');setTimeout(()=>location.reload(),100)})}
    return true;
  }
  function managerTools(){
    const s=getState(); if(!s||s.role!=='manager'||s.page!=='dashboard')return false;
    const key='missexplica_manager_data_v1'; const data=read(key,{courses:[],enrollments:[]});
    const panels=[...D.querySelectorAll('.panel')]; const target=panels[panels.length-1];
    if(!target||target.dataset.mx40Manager==='1')return false; target.dataset.mx40Manager='1';
    const html=`<div class="panel" style="margin-top:14px"><div class="panel-head"><h3>⚙️ Operação local</h3><span class="badge">${data.courses.length} curso(s) criados</span></div><div class="quick-grid"><button class="action" id="mx40NewCourse">＋ Novo curso</button><button class="action" id="mx40NewEnrollment">＋ Nova matrícula</button><button class="action" id="mx40Export">⇩ Exportar dados</button></div><div id="mx40ManagerMsg" class="notice success" hidden style="margin-top:12px"></div></div>`;
    target.insertAdjacentHTML('afterend',html);
    const msg=t=>{const e=D.getElementById('mx40ManagerMsg');if(e){e.hidden=false;e.textContent=t}};
    D.getElementById('mx40NewCourse').onclick=()=>{const name=prompt('Nome do curso:');if(!name)return;const hours=prompt('Carga horária:','20');data.courses.push({id:Date.now(),name,hours:Number(hours)||0,createdAt:new Date().toISOString()});write(key,data);msg('Curso criado neste dispositivo.');};
    D.getElementById('mx40NewEnrollment').onclick=()=>{const student=prompt('Nome do aluno:');if(!student)return;const course=prompt('Curso:');if(!course)return;data.enrollments.push({id:Date.now(),student,course,createdAt:new Date().toISOString()});write(key,data);msg('Matrícula registrada neste dispositivo.');};
    D.getElementById('mx40Export').onclick=()=>{const payload={users:read('missexplica_users',[]),manager:data,messages:read('missexplica_messages_v1',[]),certificates:read('missexplica_certificates_v1',[])};const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});const a=D.createElement('a');a.href=URL.createObjectURL(blob);a.download='missexplica-dados.json';a.click();URL.revokeObjectURL(a.href);msg('Exportação gerada com os dados locais.');};
    return true;
  }
  function init(){const target=D.getElementById('pageContent')||D.body;new MutationObserver(()=>setTimeout(()=>{teacherContentEnhance();managerTools()},30)).observe(target,{childList:true,subtree:true});setTimeout(()=>{teacherContentEnhance();managerTools()},100)}
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
