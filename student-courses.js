/* MissExplica — fonte única de cursos reais do aluno. */
(function(){
  const supabase = window.missexplicaSupabase;

  function publish(items){
    try{
      localStorage.setItem('missexplica_real_courses', JSON.stringify(items||[]));
    }catch(e){
      console.warn('[MissExplica] não foi possível armazenar cursos localmente:', e);
    }
    window.dispatchEvent(new CustomEvent('missexplica:data-ready',{detail:items||[]}));
    return items||[];
  }

  async function loadStudentCourses(){
    if(!supabase) return publish([]);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if(authError || !user) throw new Error('Sessão expirada. Entre novamente.');

    const { data, error } = await supabase
      .from('enrollments')
      .select('id,status,course_id,courses(id,title,description,workload_hours,published,modules(id,title,position,lessons(id,title,description,position,published,duration_minutes)))')
      .eq('student_id', user.id)
      .in('status',['active','completed']);

    if(error) throw error;

    const items = (data || []).map(enrollment => {
      const course = enrollment.courses || {};
      const modules = (course.modules || []).sort((a,b)=>(a.position||0)-(b.position||0));
      const lessons = modules.flatMap(module => module.lessons || []).filter(lesson => lesson.published);
      const lessonIds = new Set(lessons.map(lesson => lesson.id));

      return {
        enrollmentId: enrollment.id,
        status: enrollment.status,
        id: course.id,
        name: course.title || 'Curso',
        description: course.description || '',
        workloadHours: course.workload_hours || 0,
        modules,
        lessons: lessons.length,
        done: 0,
        progress: 0,
        nextLesson: lessons[0] || null,
        _lessonIds: [...lessonIds]
      };
    });

    for(const item of items){
      if(!item._lessonIds.length) continue;
      const {data:progress,error:progressError}=await supabase
        .from('lesson_progress')
        .select('lesson_id,completed,completed_at,watched_seconds')
        .eq('student_id',user.id)
        .in('lesson_id',item._lessonIds);
      if(progressError) throw progressError;

      const completedIds=new Set((progress||[]).filter(p=>p.completed).map(p=>p.lesson_id));
      item.done=completedIds.size;
      item.progress=item.lessons?Math.round(item.done/item.lessons*100):0;
      const allLessons=item.modules.flatMap(module=>module.lessons||[]).filter(lesson=>lesson.published);
      item.nextLesson=allLessons.find(lesson=>!completedIds.has(lesson.id))||allLessons[allLessons.length-1]||null;
      item.modules=item.modules.map(module=>({
        ...module,
        lessons:(module.lessons||[]).map(lesson=>({
          ...lesson,
          completed:completedIds.has(lesson.id),
          progress:(progress||[]).find(p=>p.lesson_id===lesson.id)||null
        }))
      }));
      delete item._lessonIds;
    }

    return publish(items);
  }

  window.loadStudentCourses=loadStudentCourses;

  window.addEventListener('missexplica:auth-ready',()=>{
    loadStudentCourses().catch(e=>console.error('[MissExplica] dados dos cursos:',e));
  });
})();
