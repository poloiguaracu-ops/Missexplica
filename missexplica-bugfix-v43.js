/* MissExplica V43 — bug fixes: lifecycle-safe enhancements and table filtering */
(function(){
'use strict';
const D=document;
const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??f}catch{return f}};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const role=()=>{try{return state?.role||'student'}catch{return'student'}};
const page=()=>{try{return state?.page||'dashboard'}catch{return'dashboard'}};
const pc=()=>D.getElementById('pageContent');
const toast=(m,type='info')=>{let e=D.getElementById('mx43-toast');if(!e){e=D.createElement('div');e.id='mx43-toast';Object.assign(e.style,{position:'fixed',right:'18px',bottom:'18px',zIndex:10003,padding:'12px 15px',borderRadius:'13px',color:'#fff',font:'700 12px/1.35 Inter,system-ui,sans-serif',boxShadow:'0 14px 30px rgba(0,0,0,.18)',maxWidth:'min(420px,calc(100vw - 36px))'});D.body.appendChild(e)}e.textContent=m;e.style.background=type==='error'?'#8d3030':type==='success'?'#0a6b46':'#14251d';clearTimeout(e._t);e._t=setTimeout(()=>e.remove(),2500)};
function managerAnalytics(){
  if(role()!=='manager'||page()!=='dashboard')return;
  const box=pc();if(!box)return;
  const old=box.querySelector('[data-mx43-analytics]');if(old)return;
  const courses=read('missexplica_courses_v1',[]),enroll=read('missexplica_enrollments_v1',[]),lessons=read('missexplica_lessons_v1',[]),users=read('missexplica_users',[]);
  const panel=D.createElement('div');panel.dataset.mx43Analytics='1';panel.className='panel';panel.style.marginTop='14px';
  panel.innerHTML=`<div class="panel-head"><h3>📊 Indicadores locais</h3><span class="badge">Somente este navegador</span></div><div class="cards" style="margin-top:12px"><div class="stat-card"><span>Usuários</span><strong>${users.length}</strong></div><div class="stat-card"><span>Cursos</span><strong>${courses.length}</strong></div><div class="stat-card"><span>Matrículas</span><strong>${enroll.length}</strong></div><div class="stat-card"><span>Aulas</span><strong>${lessons.length}</strong></div></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="action" id="mx43Backup">⇩ Backup local</button><button class="action" id="mx43Reset">Limpar dados locais</button></div>`;
  box.appendChild(panel);
  const backup=D.getElementById('mx43Backup');
  if(backup)backup.onclick=()=>{const keys=['missexplica_users','missexplica_courses_v1','missexplica_enrollments_v1','missexplica_lessons_v1','missexplica_messages_v1','missexplica_certificates_v1','missexplica_teacher_draft_v1','missexplica_course_progress_v1','missexplica_v37_state','missexplica_profile_v1'];const data={exportedAt:new Date().toISOString()};keys.forEach(k=>{const raw=localStorage.getItem(k);if(raw!==null)data[k]=read(k,null)});const a=D.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.download='missexplica-backup-local.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500);toast('Backup local criado.','success')};
  const reset=D.getElementById('mx43Reset');
  if(reset)reset.onclick=()=>{if(!confirm('Apagar somente os dados locais deste navegador?'))return;['missexplica_users','missexplica_courses_v1','missexplica_enrollments_v1','missexplica_lessons_v1','missexplica_messages_v1','missexplica_certificates_v1','missexplica_teacher_draft_v1','missexplica_course_progress_v1','missexplica_v37_state','missexplica_profile_v1'].forEach(k=>localStorage.removeItem(k));toast('Dados locais removidos.','success');setTimeout(()=>location.reload(),450)};
}
function enrollmentFilter(){
  if(role()!=='manager'||page()!=='enrollments')return;
  const table=D.querySelector('.table');if(!table)return;
  const host=table.closest('.panel')||table.parentElement;if(!host)return;
  if(host.querySelector('[data-mx43-filter]'))return;
  const wrap=D.createElement('div');wrap.dataset.mx43Filter='1';wrap.className='panel';wrap.style.marginBottom='12px';
  wrap.innerHTML='<label for="mx43Filter"><strong>Filtrar matrículas</strong></label><input id="mx43Filter" type="search" placeholder="Aluno ou curso..." autocomplete="off">';
  host.parentNode.insertBefore(wrap,host);
  const input=wrap.querySelector('input');
  input.oninput=()=>{const q=input.value.toLocaleLowerCase().trim();table.querySelectorAll('tr').forEach((r,i)=>{if(i===0)return;r.hidden=!!q&&!r.textContent.toLocaleLowerCase().includes(q)})};
}
function studentRecovery(){
  if(role()!=='student')return;
  const room=D.querySelector('.course-room');if(!room)return;
  const btn=D.getElementById('completeLesson');if(!btn)return;
  const title=room.querySelector('.course-room-head h1');if(!title)return;
  const p=read('missexplica_course_progress_v1',{});
  if(p[title.textContent.trim()]?.completed){btn.textContent='✓ Aula concluída';btn.disabled=true;btn.classList.remove('green-btn');btn.classList.add('action')}
}
function run(){managerAnalytics();enrollmentFilter();studentRecovery()}
function init(){const target=pc()||D.body;const mo=new MutationObserver(()=>setTimeout(run,25));mo.observe(target,{childList:true,subtree:true});run()}
if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
