/* MissExplica — central de comunicação professor/aluno. */
(function(){
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 async function load(courseId){const sb=window.missExplicaSupabase;if(!sb)throw new Error('Supabase não configurado.');const {data,error}=await sb.from('course_announcements').select('id,title,body,created_at').eq('course_id',courseId).order('created_at',{ascending:false});if(error)throw error;return data||[]}
 function render(root,items){root.innerHTML=`<section class="teacher-student-center"><div class="center-head"><div><span class="section-tag">COMUNICAÇÃO</span><h2>Central do curso</h2><p>Publique avisos e mantenha os alunos informados.</p></div><button class="green-btn" id="newAnnouncement">+ Novo aviso</button></div><div class="announcement-list">${items.map(x=>`<article class="announcement"><span>📢</span><div><strong>${esc(x.title)}</strong><p>${esc(x.body)}</p><small>${new Date(x.created_at).toLocaleDateString('pt-BR')}</small></div></article>`).join('')||'<div class="empty-state"><h3>Nenhum aviso publicado</h3><p>Crie o primeiro comunicado para seus alunos.</p></div>'}</div></section>`}
 window.MissExplicaTeacherStudentCenter={load,render};
})();
