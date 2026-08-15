/* MissExplica — painel de gestão: visão operacional de usuários, cursos e matrículas. */
(function(){
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  async function ensure(){const p=await window.MissExplicaData.profile();if(p.role!=='manager')throw new Error('Área exclusiva para gestores.');return p;}
  async function load(){await ensure();const sb=window.missExplicaSupabase;if(!sb)throw new Error('Supabase não configurado.');
    const [users,courses,enrollments]=await Promise.all([
      sb.from('profiles').select('id,full_name,email,role,created_at').order('created_at',{ascending:false}).limit(100),
      sb.from('courses').select('id,title,published,teacher_id').order('title'),
      sb.from('enrollments').select('id,student_id,course_id,status,created_at').order('created_at',{ascending:false}).limit(200)
    ]); if(users.error)throw users.error;if(courses.error)throw courses.error;if(enrollments.error)throw enrollments.error;
    return {users:users.data||[],courses:courses.data||[],enrollments:enrollments.data||[]};
  }
  function render(root,data){
    const u=data.users,c=data.courses,e=data.enrollments;const teachers=u.filter(x=>x.role==='teacher').length,students=u.filter(x=>x.role==='student').length;
    root.innerHTML=`<div class="manager-panel"><header class="manager-header"><div><span class="section-tag">GESTÃO MISSEXPLICA</span><h1>Painel administrativo</h1><p>Controle usuários, cursos e matrículas em um só lugar.</p></div><button id="managerRefresh" class="outline-btn">↻ Atualizar</button></header><section class="manager-stats"><div><strong>${u.length}</strong><span>Usuários</span></div><div><strong>${students}</strong><span>Alunos</span></div><div><strong>${teachers}</strong><span>Professores</span></div><div><strong>${e.filter(x=>x.status==='active').length}</strong><span>Matrículas ativas</span></div></section><div class="manager-grid"><section class="manager-card"><div class="card-title"><h2>Usuários</h2><span>${u.length}</span></div><div class="manager-table">${u.map(x=>`<div class="manager-row"><div><strong>${esc(x.full_name||'Sem nome')}</strong><small>${esc(x.email||'')}</small></div><span class="role-badge role-${esc(x.role)}">${esc(x.role)}</span></div>`).join('')||'<p>Nenhum usuário encontrado.</p>'}</div></section><section class="manager-card"><div class="card-title"><h2>Cursos</h2><span>${c.length}</span></div><div class="manager-table">${c.map(x=>`<div class="manager-row"><div><strong>${esc(x.title)}</strong><small>${x.published?'Disponível para publicação':'Rascunho'}</small></div><span class="role-badge">${e.filter(y=>y.course_id===x.id&&y.status==='active').length} alunos</span></div>`).join('')||'<p>Nenhum curso encontrado.</p>'}</div></section></div></div>`;
    root.querySelector('#managerRefresh')?.addEventListener('click',async()=>{root.innerHTML='<div class="empty-state"><h3>Atualizando...</h3></div>';try{render(root,await load())}catch(err){root.innerHTML=`<div class="empty-state error"><h3>Erro</h3><p>${esc(err.message)}</p></div>`}});
  }
  window.MissExplicaManager={load,render};
})();
