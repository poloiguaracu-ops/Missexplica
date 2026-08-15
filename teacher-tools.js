/* MissExplica — ferramentas do professor. A UI só chama operações autorizadas no backend. */
(function(){
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  async function ensureTeacher(){const p=await window.MissExplicaData.profile();if(p.role!=='teacher'&&p.role!=='manager')throw new Error('Área exclusiva para professores.');return p;}
  window.MissExplicaTeacher={
    async loadCourses(){
      await ensureTeacher();
      const sb=window.missExplicaSupabase;
      const {data,error}=await sb.from('courses').select('id,title,description,published,teacher_id,modules(id,title,position,lessons(id,title,description,position,published))').order('title');
      if(error)throw error;return data||[];
    },
    renderCourses(root,courses){
      root.innerHTML=(courses||[]).map(c=>`<article class="teacher-course-card"><div><span class="course-status">${c.published?'Publicado':'Rascunho'}</span><h3>${esc(c.title)}</h3><p>${esc(c.description||'Sem descrição')}</p></div><div class="teacher-course-meta">${(c.modules||[]).length} módulos • ${(c.modules||[]).reduce((n,m)=>n+(m.lessons||[]).length,0)} aulas</div><button class="green-btn" data-teacher-course="${c.id}">Gerenciar conteúdo →</button></article>`).join('')||'<div class="empty-state"><h3>Nenhum curso disponível</h3><p>Os cursos atribuídos ao professor aparecerão aqui.</p></div>';
    }
  };
})();
