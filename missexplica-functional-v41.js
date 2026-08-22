/* MissExplica V41 — operational flows for courses, lessons and enrollments */
(function(){
  'use strict';
  const D=document;
  const COURSES_KEY='missexplica_courses_v1';
  const ENROLL_KEY='missexplica_enrollments_v1';
  const LESSONS_KEY='missexplica_lessons_v1';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const read=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||'null')??f}catch{return f}};
  const write=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const toast=(m,type='info')=>{let e=D.getElementById('mx41-toast');if(!e){e=D.createElement('div');e.id='mx41-toast';Object.assign(e.style,{position:'fixed',right:'18px',bottom:'18px',zIndex:10001,padding:'12px 15px',borderRadius:'13px',color:'#fff',font:'700 12px/1.35 Inter,system-ui,sans-serif',boxShadow:'0 14px 30px rgba(0,0,0,.18)',maxWidth:'min(400px,calc(100vw - 36px))'});D.body.appendChild(e)}e.textContent=m;e.style.background=type==='error'?'#8d3030':type==='success'?'#0a6b46':'#14251d';clearTimeout(e._t);e._t=setTimeout(()=>e.remove(),2600)};
  function role(){try{return state?.role||'student'}catch{return' student'.trim()}}
  function page(){try{return state?.page||'dashboard'}catch{return'dashboard'}}
  function pageContent(){return D.getElementById('pageContent')}
  function seed(){let c=read(COURSES_KEY,[]);if(!c.length){c=[
    {id:'gestao',name:'Introdução à Gestão',meta:'Curso Livre • 20 horas',active:true},
    {id:'vendas',name:'Atendimento e Vendas',meta:'Curso Livre • 15 horas',active:true},
    {id:'informatica',name:'Informática Essencial',meta:'Curso Livre • 25 horas',active:true},
    {id:'comunicacao',name:'Comunicação Profissional',meta:'Curso Livre • 12 horas',active:true}
  ];write(COURSES_KEY,c)}return c}
  function enhanceManagerCourses(){if(role()!=='manager'||page()!=='courses')return false;const pc=pageContent();if(!pc)return false;const courses=seed();pc.innerHTML=`<div class="welcome"><div><h1>Gerenciar cursos</h1><p>Crie, ative, desative e organize os cursos da plataforma.</p></div><button class="green-btn" id="mx41NewCourse">＋ Novo curso</button></div><div class="panel"><div id="mx41CourseList">${courses.map(c=>`<div class="course-card" data-id="${esc(c.id)}" style="margin-bottom:10px"><div class="course-cover">ME</div><div class="course-info"><strong>${esc(c.name)}</strong><span>${esc(c.meta)}</span><small>${c.active?'Ativo':'Inativo'}</small></div><button class="action mx41Toggle" data-id="${esc(c.id)}">${c.active?'Desativar':'Ativar'}</button></div>`).join('')}</div></div>`;
    D.getElementById('mx41NewCourse').onclick=()=>{const name=prompt('Nome do curso:');if(!name?.trim())return;const meta=prompt('Descrição curta/duração:','Curso Livre')||'Curso Livre';courses.push({id:'c'+Date.now(),name:name.trim(),meta:meta.trim(),active:true});write(COURSES_KEY,courses);toast('Curso criado neste dispositivo.','success');enhanceManagerCourses()};
    D.querySelectorAll('.mx41Toggle').forEach(b=>b.onclick=()=>{const c=courses.find(x=>x.id===b.dataset.id);if(c){c.active=!c.active;write(COURSES_KEY,courses);toast(c.active?'Curso ativado.':'Curso desativado.','success');enhanceManagerCourses()}});return true}
  function enhanceEnrollments(){if(role()!=='manager'||page()!=='enrollments')return false;const pc=pageContent();if(!pc)return false;const enroll=read(ENROLL_KEY,[]);pc.innerHTML=`<div class="welcome"><div><h1>Matrículas</h1><p>Controle as matrículas registradas neste navegador.</p></div><button class="green-btn" id="mx41Enroll">＋ Nova matrícula</button></div><div class="panel"><table class="table"><tr><th>Aluno</th><th>Curso</th><th>Status</th><th>Ação</th></tr>${enroll.length?enroll.map((e,i)=>`<tr><td>${esc(e.student)}</td><td>${esc(e.course)}</td><td>${esc(e.status)}</td><td><button class="action mx41Cancel" data-i="${i}">Cancelar</button></td></tr>`).join(''):'<tr><td colspan="4">Nenhuma matrícula registrada neste dispositivo.</td></tr>'}</table></div>`;
    D.getElementById('mx41Enroll').onclick=()=>{const student=prompt('Nome do aluno:');if(!student?.trim())return;const course=prompt('Nome do curso:');if(!course?.trim())return;enroll.push({student:student.trim(),course:course.trim(),status:'Ativa',createdAt:new Date().toISOString()});write(ENROLL_KEY,enroll);toast('Matrícula registrada.','success');enhanceEnrollments()};
    D.querySelectorAll('.mx41Cancel').forEach(b=>b.onclick=()=>{if(!confirm('Cancelar esta matrícula?'))return;enroll[+b.dataset.i].status='Cancelada';write(ENROLL_KEY,enroll);toast('Matrícula cancelada.');enhanceEnrollments()});return true}
  function enhanceTeacherContent(){if(role()!=='teacher'||page()!=='content')return false;const pc=pageContent();if(!pc)return false;const lessons=read(LESSONS_KEY,[]);setTimeout(()=>{const box=pc.querySelector('.panel');if(!box)return;let list=D.getElementById('mx41LessonList');if(!list){list=D.createElement('div');list.id='mx41LessonList';list.className='panel';list.style.marginTop='14px';box.parentNode.appendChild(list)}list.innerHTML=`<h3>📚 Aulas criadas neste dispositivo</h3>${lessons.length?lessons.map((l,i)=>`<div class="course-card" style="margin-bottom:10px"><div class="course-info"><strong>${esc(l.title)}</strong><span>${esc(l.module)} • ${esc(l.status)}</span><small>${new Date(l.createdAt).toLocaleString('pt-BR')}</small></div><button class="action mx41DeleteLesson" data-i="${i}">Excluir</button></div>`).join(''):'<div class="empty">Nenhuma aula criada ainda.</div>'};list.querySelectorAll('.mx41DeleteLesson').forEach(b=>b.onclick=()=>{if(!confirm('Excluir esta aula local?'))return;lessons.splice(+b.dataset.i,1);write(LESSONS_KEY,lessons);enhanceTeacherContent()});},40);return true}
  function observe(){const target=pageContent()||D.body;new MutationObserver(()=>setTimeout(run,30)).observe(target,{childList:true,subtree:true})}
  function run(){if(enhanceManagerCourses())return;if(enhanceEnrollments())return;enhanceTeacherContent()}
  function init(){seed();observe();setTimeout(run,100)}
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
