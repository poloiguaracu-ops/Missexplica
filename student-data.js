/* MissExplica — dados reais do aluno. Não substitui as regras RLS do banco. */
(function(){
  const cfg=window.MISSEXPLICA_SUPABASE;
  const configured=cfg && cfg.url && cfg.anonKey && !cfg.url.includes('SEU-PROJETO') && !cfg.anonKey.includes('SUA_ANON');
  if(!configured)return;
  const load=()=>{
    const client=window.missexplicaSupabase;
    if(!client)return setTimeout(load,500);
    client.auth.getUser().then(async({data,error})=>{
      if(error||!data.user)return;
      const uid=data.user.id;
      const {data:rows}=await client.from('enrollments').select('id,course_id,status,courses(id,title,description,duration_hours)').eq('student_id',uid).eq('status','active');
      if(!rows)return;
      const ids=rows.map(r=>r.course_id).filter(Boolean);
      let lessons=[]; if(ids.length){const r=await client.from('lessons').select('id,module_id,title,modules!inner(course_id)').in('modules.course_id',ids);lessons=r.data||[];}
      const lessonIds=lessons.map(x=>x.id);
      let progress=[]; if(lessonIds.length){const r=await client.from('lesson_progress').select('lesson_id,completed,completed_at').eq('student_id',uid).in('lesson_id',lessonIds);progress=r.data||[];}
      const done=new Set(progress.filter(x=>x.completed).map(x=>x.lesson_id));
      const model=rows.map(r=>{const ls=lessons.filter(l=>l.modules?.course_id===r.course_id);const d=ls.filter(l=>done.has(l.id)).length;return {id:r.course_id,name:r.courses?.title||'Curso',meta:`Curso Livre • ${r.courses?.duration_hours||0} horas`,lessons:ls.length,done:d,progress:ls.length?Math.round(d/ls.length*100):0};});
      localStorage.setItem('missexplica_real_courses',JSON.stringify(model));
      window.dispatchEvent(new CustomEvent('missexplica:data-ready',{detail:model}));
    });
  };
  window.addEventListener('missexplica:auth-ready',load); setTimeout(load,700);
})();
