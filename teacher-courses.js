/* MissExplica — carrega somente cursos atribuídos ao professor logado. */
(function(){
 async function load(){const sb=window.missExplicaSupabase;if(!sb)throw new Error('Supabase não configurado.');const {data:user}=await sb.auth.getUser();if(!user.user)throw new Error('Faça login novamente.');const {data,error}=await sb.from('my_teacher_courses').select('id,title,published,teacher_id').order('title');if(error)throw error;return data||[]}
 function render(root,courses){root.innerHTML=courses.length?courses.map(c=>`<article class="teacher-course-card"><div><span class="course-status ${c.published?'published':''}">${c.published?'Publicado':'Rascunho'}</span><h3>${String(c.title).replace(/[&<>]/g,'')}</h3><p>Curso atribuído a você. Gerencie módulos e aulas.</p></div><button class="green-btn" data-course="${c.id}">Abrir curso</button></article>`).join(''):'<div class="empty-state"><h3>Nenhum curso atribuído</h3><p>O gestor ainda não atribuiu cursos à sua conta.</p></div>'}
 window.MissExplicaTeacherCourses={load,render};
})();
