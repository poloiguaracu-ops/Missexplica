/* MissExplica — experiência do aluno: estado, progresso e navegação sem dados fictícios. */
(function(){
  const $=s=>document.querySelector(s);
  async function render(){
    const root=$('#studentExperience');
    if(!root || !window.MissExplicaData) return;
    try{
      const profile=await window.MissExplicaData.profile();
      if(profile.role!=='student') return;
      const courses=await window.MissExplicaData.studentCourses();
      if(!courses.length){
        root.innerHTML='<div class="empty-state"><div class="empty-icon">📚</div><h3>Nenhum curso liberado ainda</h3><p>Quando sua matrícula for liberada pela MissExplica, o curso aparecerá automaticamente aqui.</p></div>';
        return;
      }
      root.innerHTML=courses.map(e=>{
        const c=e.course||{}; const modules=c.modules||[];
        const lessons=modules.flatMap(m=>m.lessons||[]).filter(l=>l.published);
        return `<article class="student-course-card" data-course="${c.id}"><div class="course-card-top"><span class="course-status">${e.status==='completed'?'Concluído':'Em andamento'}</span><span>${lessons.length} aulas</span></div><h3>${escapeHtml(c.title||'Curso')}</h3><p>${escapeHtml(c.description||'Seu curso MissExplica.')}</p><div class="course-progress"><div class="progress-track"><i style="width:${progress(lessons)}%"></i></div><strong>${progress(lessons)}%</strong></div><button class="green-btn continue-course" data-course="${c.id}">Continuar curso →</button></article>`;
      }).join('');
    }catch(err){root.innerHTML=`<div class="empty-state error"><h3>Não foi possível carregar seus cursos</h3><p>${escapeHtml(err.message||'Tente entrar novamente.')}</p></div>`;}
  }
  function progress(lessons){let done=0; lessons.forEach(l=>{if((l.lesson_progress||[]).some(p=>p.completed))done++}); return lessons.length?Math.round(done/lessons.length*100):0}
  function escapeHtml(v){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  document.addEventListener('click',e=>{const b=e.target.closest('.continue-course'); if(b && window.openStudentCourse) window.openStudentCourse(b.dataset.course)});
  window.MissExplicaStudent={render};
})();
