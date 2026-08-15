/* MissExplica — sala de aula: módulos, aulas e progresso. */
(function(){
  const $=s=>document.querySelector(s);
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  let current=null;
  function lessons(course){return (course?.modules||[]).flatMap(m=>(m.lessons||[]).map(l=>({...l,moduleTitle:m.title||'Módulo'}))).filter(l=>l.published);}
  window.openStudentCourse=async function(courseId){
    if(!window.MissExplicaData) return;
    const courses=await window.MissExplicaData.studentCourses();
    const enrollment=courses.find(e=>e.course?.id===courseId);
    if(!enrollment) throw new Error('Curso não disponível para sua conta.');
    current={enrollment,lessons:lessons(enrollment.course),index:0};
    render();
  };
  function render(){
    const root=$('#pageContent'); if(!root||!current)return;
    const c=current.enrollment.course||{}; const ls=current.lessons; const l=ls[current.index];
    root.innerHTML=`<div class="classroom"><aside class="classroom-sidebar"><div class="classroom-course"><span>CURSO</span><h3>${esc(c.title)}</h3></div>${(c.modules||[]).map((m,mi)=>`<div class="lesson-group"><strong>${esc(m.title||`Módulo ${mi+1}`)}</strong>${(m.lessons||[]).filter(x=>x.published).map(x=>`<button class="lesson-item ${l&&x.id===l.id?'active':''}" data-lesson="${x.id}">${esc(x.title)}</button>`).join('')}</div>`).join('')}</aside><section class="classroom-main">${l?`<div class="classroom-head"><span>${esc(l.moduleTitle)}</span><span>Aula ${current.index+1} de ${ls.length}</span></div><div class="video-placeholder">${l.video_url?`<iframe src="${esc(l.video_url)}" title="${esc(l.title)}" allowfullscreen></iframe>`:'<div class="video-icon">▶</div><p>O vídeo desta aula será disponibilizado pelo professor.</p>'}</div><h1>${esc(l.title)}</h1><p class="lesson-description">${esc(l.description||'Nesta aula você encontrará o conteúdo preparado pelo professor.')}</p><div class="classroom-actions"><button id="completeLesson" class="green-btn">✓ Marcar aula como concluída</button><button id="nextLesson" class="outline-btn" ${current.index>=ls.length-1?'disabled':''}>Próxima aula →</button></div>`:'<div class="empty-state"><h3>Nenhuma aula publicada</h3><p>O professor ainda não publicou aulas neste curso.</p></div>'}</section></div>`;
    root.querySelectorAll('[data-lesson]').forEach(b=>b.onclick=()=>{const i=ls.findIndex(x=>x.id===b.dataset.lesson);if(i>=0){current.index=i;render()}});
    $('#completeLesson')?.addEventListener('click',async()=>{try{await window.MissExplicaData.completeLesson(l.id);$('#completeLesson').textContent='✓ Aula concluída';$('#completeLesson').disabled=true}catch(e){alert(e.message||'Não foi possível salvar o progresso.')}});
    $('#nextLesson')?.addEventListener('click',()=>{if(current.index<ls.length-1){current.index++;render()}});
  }
})();
