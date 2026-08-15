/* MissExplica — painel visual do professor: cursos, módulos e aulas. */
(function(){
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const $=s=>document.querySelector(s);
  async function render(root){
    try{
      const courses=await window.MissExplicaTeacherEditor.courses();
      root.innerHTML=`<div class="teacher-panel"><div class="panel-heading"><div><span class="section-tag">ÁREA DO PROFESSOR</span><h1>Seus cursos</h1><p>Crie aulas, organize módulos e publique conteúdos.</p></div><button id="teacherRefresh" class="outline-btn">↻ Atualizar</button></div><div class="teacher-course-list">${courses.map(c=>`<article class="teacher-editor-card"><div class="editor-card-head"><div><span class="course-status ${c.published?'published':''}">${c.published?'Publicado':'Rascunho'}</span><h3>${esc(c.title)}</h3></div><span>${(c.modules||[]).length} módulos</span></div><p>${esc(c.description||'Sem descrição.')}</p><div class="module-list">${(c.modules||[]).map(m=>`<div class="module-row"><div><strong>${esc(m.title)}</strong><small>${(m.lessons||[]).length} aulas</small></div><div class="lesson-list">${(m.lessons||[]).map(l=>`<span class="lesson-pill">${l.published?'●':'○'} ${esc(l.title)}</span>`).join('')}</div><button class="small-btn new-lesson" data-module="${m.id}">+ Aula</button></div>`).join('')||'<div class="empty-module">Nenhum módulo. Crie o primeiro.</div>'}</div><div class="editor-actions"><button class="green-btn new-module" data-course="${c.id}">+ Novo módulo</button></div></article>`).join('')||'<div class="empty-state"><h3>Nenhum curso atribuído</h3><p>Quando um gestor atribuir um curso, ele aparecerá aqui.</p></div>'}</div></div>`;
      $('#teacherRefresh')?.addEventListener('click',()=>render(root));
      root.querySelectorAll('.new-module').forEach(b=>b.onclick=async()=>{const title=prompt('Nome do módulo:');if(!title)return;try{await window.MissExplicaTeacherEditor.createModule(b.dataset.course,title);await render(root)}catch(e){alert(e.message||'Erro ao criar módulo')}});
      root.querySelectorAll('.new-lesson').forEach(b=>b.onclick=async()=>{const title=prompt('Título da aula:');if(!title)return;const video=prompt('URL do vídeo (opcional):')||'';const desc=prompt('Descrição da aula (opcional):')||'';try{await window.MissExplicaTeacherEditor.createLesson(b.dataset.module,title,desc,video);await render(root)}catch(e){alert(e.message||'Erro ao criar aula')}});
    }catch(e){root.innerHTML=`<div class="empty-state error"><h3>Não foi possível carregar o painel</h3><p>${esc(e.message||'Tente novamente.')}</p></div>`}
  }
  window.MissExplicaTeacherUI={render};
})();
