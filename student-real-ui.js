/* MissExplica — camada de UI real do aluno. Remove dependência visual de dados fictícios. */
(function(){
  const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const readCourses = () => {
    try {
      const value = JSON.parse(localStorage.getItem('missexplica_real_courses') || '[]');
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  };

  function renderRealCourses(){
    const root=document.getElementById('pageContent');
    if(!root) return;
    const courses=readCourses();
    if(!courses.length){
      root.innerHTML=`<div class="role-banner"><div class="role-icon">🎓</div><div><strong>Meus cursos</strong><span>Você ainda não possui um curso liberado.</span></div></div><div class="panel"><div class="empty"><strong>Nenhum curso disponível.</strong><br>Quando uma matrícula for liberada, o curso aparecerá automaticamente aqui.</div></div>`;
      return;
    }
    const cards=courses.map(course=>{
      const progress=Math.max(0,Math.min(100,Number(course.progress)||0));
      const lessonCount=Number(course.lessons)||0;
      const done=Number(course.done)||0;
      const next=course.nextLesson?.title||'Nenhuma aula pendente';
      return `<article class="course-card"><div class="course-cover">ME</div><div class="course-info"><strong>${escapeHtml(course.name)}</strong><span>${escapeHtml(course.description||'Curso MissExplica')} • ${lessonCount} aula(s)</span><div class="progress"><i style="width:${progress}%"></i></div><small>${progress}% concluído • ${done}/${lessonCount} aulas</small><small>Próxima: ${escapeHtml(next)}</small></div><button class="action real-study-course" data-course-id="${escapeHtml(course.id)}">${progress>=100?'Revisar':'Continuar'}</button></article>`;
    }).join('');
    const avg=Math.round(courses.reduce((sum,c)=>sum+Math.max(0,Math.min(100,Number(c.progress)||0)),0)/courses.length);
    const done=courses.reduce((sum,c)=>sum+(Number(c.done)||0),0);
    root.innerHTML=`<div class="role-banner"><div class="role-icon">🎓</div><div><strong>Meus cursos</strong><span>Conteúdo e progresso sincronizados com sua matrícula.</span></div></div><div class="cards"><div class="stat-card"><span>Cursos ativos</span><strong>${courses.filter(c=>c.status==='active').length}</strong></div><div class="stat-card"><span>Aulas concluídas</span><strong>${done}</strong></div><div class="stat-card"><span>Progresso médio</span><strong>${avg}%</strong></div><div class="stat-card"><span>Cursos concluídos</span><strong>${courses.filter(c=>c.progress>=100).length}</strong></div></div><div class="panel"><div class="course-list">${cards}</div></div>`;
    root.querySelectorAll('.real-study-course').forEach(button=>button.addEventListener('click',()=>{
      const selected=courses.find(c=>String(c.id)===String(button.dataset.courseId));
      window.dispatchEvent(new CustomEvent('missexplica:course-selected',{detail:selected||null}));
      const firstLesson=selected?.nextLesson;
      if(firstLesson) window.alert(`Próxima aula: ${firstLesson.title}`);
    }));
  }

  const previousRender=window.render;
  window.render=function(){
    if(typeof previousRender==='function') previousRender.apply(this,arguments);
    const role=localStorage.getItem('missexplica_role');
    const page=document.getElementById('pageTitle')?.textContent?.trim();
    if(role==='student' && page==='Meus cursos') renderRealCourses();
  };

  window.addEventListener('missexplica:data-ready',()=>{
    if(localStorage.getItem('missexplica_role')==='student' && document.getElementById('pageTitle')?.textContent?.trim()==='Meus cursos') renderRealCourses();
  });
})();
