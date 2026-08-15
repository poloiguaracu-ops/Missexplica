/* MissExplica — ponte entre a interface e os cursos reais do Supabase.
   Mantém a interface demonstrativa como fallback quando o banco ainda não está configurado. */
(function(){
  function escapeHtml(value){return String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
  function getSupabase(){return window.missExplicaSupabase || window.supabaseClient || null;}
  function realCoursesMarkup(courses){
    if(!courses.length) return `<div class="empty"><strong>Nenhum curso liberado ainda.</strong><br><span>Sua matrícula aparecerá aqui quando a equipe da MissExplica liberar um curso.</span></div>`;
    return `<div class="course-list">${courses.map((c,i)=>`<div class="course-card real-course-card"><div class="course-cover">ME</div><div class="course-info"><strong>${escapeHtml(c.name)}</strong><span>${escapeHtml(c.description || 'Curso livre')} • ${c.lessons} aulas</span><div class="progress"><i style="width:${c.progress}%"></i></div><small>${c.progress}% concluído • ${c.done}/${c.lessons} aulas</small></div><button class="action real-open-course" data-real-course="${i}">${c.progress===100?'Revisar':'Continuar'}</button></div>`).join('')}</div>`;
  }
  async function renderRealCourses(){
    if(!window.loadStudentCourses) return;
    const container=document.getElementById('pageContent');
    if(!container) return;
    container.innerHTML=`<div class="welcome"><div><div class="section-tag">MEUS CURSOS</div><h1>Seus cursos</h1><p>Somente cursos liberados para sua matrícula aparecem aqui.</p></div></div><div class="panel"><div class="loading-state">Carregando seus cursos...</div></div>`;
    try{
      const courses=await window.loadStudentCourses();
      if(!courses) return;
      container.innerHTML=`<div class="welcome"><div><div class="section-tag">MEUS CURSOS</div><h1>Continue aprendendo</h1><p>Escolha um curso para continuar seus estudos.</p></div></div><div class="panel">${realCoursesMarkup(courses)}</div>`;
      container.querySelectorAll('.real-open-course').forEach(btn=>btn.addEventListener('click',()=>openRealCourse(courses[Number(btn.dataset.realCourse)])));
    }catch(error){
      console.error('[MissExplica] cursos:',error);
      container.innerHTML=`<div class="panel"><div class="empty"><strong>Não foi possível carregar seus cursos.</strong><br><span>Verifique sua conexão e tente novamente. Se o problema continuar, fale com a equipe.</span><br><button class="action" id="retryStudentCourses">Tentar novamente</button></div></div>`;
      document.getElementById('retryStudentCourses')?.addEventListener('click',renderRealCourses);
    }
  }
  function openRealCourse(course){
    const container=document.getElementById('pageContent'); if(!container) return;
    const firstLesson=(course.modules||[]).flatMap(m=>m.lessons||[]).find(l=>l.published) || null;
    container.innerHTML=`<div class="course-room"><button class="back-course" id="backRealCourses">← Voltar para meus cursos</button><div class="course-room-head"><div><span class="section-tag">SALA DE AULA</span><h1>${escapeHtml(course.name)}</h1><p>${course.progress}% concluído • ${course.done}/${course.lessons} aulas</p></div><div class="course-score"><strong>${course.progress}%</strong><span>progresso</span></div></div><div class="lesson-layout"><div class="lesson-main"><div class="video-placeholder"><div class="video-play">▶</div><span>${escapeHtml(firstLesson?.title || 'Próxima aula')}</span><small>O conteúdo publicado pelo professor aparecerá aqui.</small></div><div class="lesson-title"><div><span class="lesson-kicker">PRÓXIMA AULA</span><h2>${escapeHtml(firstLesson?.title || 'Seu curso está pronto')}</h2><p>${escapeHtml(firstLesson?.description || 'Continue seu curso no seu ritmo.')}</p></div>${firstLesson?'<button class="green-btn" id="completeRealLesson">✓ Marcar como concluída</button>':''}</div></div><aside class="lesson-sidebar"><h3>Conteúdo do curso</h3>${(course.modules||[]).map(m=>`<div class="module-block"><strong>${escapeHtml(m.title)}</strong>${(m.lessons||[]).filter(l=>l.published).map(l=>`<div class="lesson-item"><span>•</span><div><strong>${escapeHtml(l.title)}</strong><small>Aula</small></div></div>`).join('')}</div>`).join('') || '<div class="empty">O professor ainda não publicou aulas.</div>'}</aside></div></div>`;
    document.getElementById('backRealCourses')?.addEventListener('click',renderRealCourses);
    document.getElementById('completeRealLesson')?.addEventListener('click',async function(){
      if(!firstLesson || !window.missExplicaSupabase) return;
      this.disabled=true; this.textContent='Salvando...';
      const {data,error}=await window.missExplicaSupabase.rpc('student_complete_lesson',{target_lesson:firstLesson.id});
      if(error){this.disabled=false;this.textContent='Tentar novamente';alert('Não foi possível salvar o progresso.');return;}
      this.textContent='✓ Aula concluída';
    });
  }
  const originalRender=window.render;
  if(typeof originalRender==='function'){
    window.render=function(){
      originalRender.apply(this,arguments);
      const role=localStorage.getItem('missexplica_role');
      const page=window.__missexplicaPage;
      if(role==='student' && page==='courses') setTimeout(renderRealCourses,0);
    };
  }
  window.missExplicaRenderRealCourses=renderRealCourses;
  document.addEventListener('click',function(e){
    const nav=e.target.closest?.('[data-page="courses"]');
    if(nav) setTimeout(renderRealCourses,0);
  });
})();
