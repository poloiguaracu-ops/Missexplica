/* MissExplica — fonte única de dados reais do aluno. */
(function(){
 const cfg=window.MISSEXPLICA_SUPABASE;
 const configured=cfg&&cfg.url&&cfg.anonKey&&!cfg.url.includes('SEU-PROJETO')&&!cfg.anonKey.includes('SUA_ANON');
 async function load(){
  const client=window.missexplicaSupabase;if(!client)return null;
  const {data:{user},error:authError}=await client.auth.getUser();
  if(authError||!user)return null;
  const result=await client.from('enrollments').select('id,status,course_id,courses(id,title,description,workload_hours,modules(id,title,position,lessons(id,title,description,position,published,duration_minutes)))').eq('student_id',user.id).in('status',['active','completed']);
  if(result.error)throw result.error;
  const items=[];
  for(const enrollment of result.data||[]){
   const course=enrollment.courses||{};const modules=(course.modules||[]).sort((a,b)=>(a.position||0)-(b.position||0));
   const lessons=modules.flatMap(m=>m.lessons||[]).filter(l=>l.published);const ids=lessons.map(l=>l.id);
   let progress=[];if(ids.length){const p=await client.from('lesson_progress').select('lesson_id,completed,completed_at,watched_seconds').eq('student_id',user.id).in('lesson_id',ids);if(p.error)throw p.error;progress=p.data||[]}
   const done=new Set(progress.filter(p=>p.completed).map(p=>p.lesson_id));
   const hydrated=modules.map(m=>({...m,lessons:(m.lessons||[]).map(l=>({...l,completed:done.has(l.id),progress:progress.find(p=>p.lesson_id===l.id)||null}))}));
   const nextLesson=lessons.find(l=>!done.has(l.id))||lessons[lessons.length-1]||null;
   items.push({enrollmentId:enrollment.id,status:enrollment.status,id:course.id,name:course.title||'Curso',description:course.description||'',workloadHours:course.workload_hours||0,modules:hydrated,lessons:lessons.length,done:done.size,progress:lessons.length?Math.round(done.size/lessons.length*100):0,nextLesson});
  }
  localStorage.setItem('missexplica_real_courses',JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('missexplica:data-ready',{detail:items}));
  return items;
 }
 window.loadStudentCourses=load;
 window.addEventListener('missexplica:auth-ready',()=>{if(configured)load().catch(e=>console.error('[MissExplica] dados:',e))});
})();
