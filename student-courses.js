/* MissExplica — fonte única de cursos reais do aluno. */
(function(){
  const getClient=()=>window.missexplicaSupabase||null;
  let loadingPromise=null;

  function publish(items){
    const safeItems=Array.isArray(items)?items:[];
    try{
      localStorage.setItem('missexplica_real_courses',JSON.stringify(safeItems));
    }catch(e){
      console.warn('[MissExplica] não foi possível armazenar cursos localmente:',e);
    }
    window.dispatchEvent(new CustomEvent('missexplica:data-ready',{detail:safeItems}));
    return safeItems;
  }

  async function loadStudentCourses(){
    if(loadingPromise) return loadingPromise;

    loadingPromise=(async()=>{
      const supabase=getClient();
      if(!supabase) return publish([]);

      const {data:{user},error:authError}=await supabase.auth.getUser();
      if(authError||!user) throw new Error('Sessão expirada. Entre novamente.');

      const {data,error}=await supabase
        .from('enrollments')
        .select('id,status,course_id,courses(id,title,description,workload_hours,published,modules(id,title,position,lessons(id,title,description,position,published,duration_minutes)))')
        .eq('student_id',user.id)
        .in('status',['active','completed'])
        .eq('courses.published',true);

      if(error) throw error;

      const items=(data||[])
        .filter(enrollment=>enrollment.courses)
        .map(enrollment=>{
          const course=enrollment.courses||{};
          const modules=[...(course.modules||[])]
            .sort((a,b)=>(a.position||0)-(b.position||0))
            .map(module=>({
              ...module,
              lessons:[...(module.lessons||[])]
                .filter(lesson=>lesson.published===true)
                .sort((a,b)=>(a.position||0)-(b.position||0))
            }));
          const lessons=modules.flatMap(module=>module.lessons||[]);
          return {
            enrollmentId:enrollment.id,
            status:enrollment.status,
            id:course.id,
            name:course.title||'Curso',
            description:course.description||'',
            workloadHours:course.workload_hours||0,
            modules,
            lessons:lessons.length,
            done:0,
            progress:0,
            nextLesson:lessons[0]||null,
            _lessonIds:lessons.map(lesson=>lesson.id)
          };
        });

      const allLessonIds=[...new Set(items.flatMap(item=>item._lessonIds||[]))];
      let progressRows=[];
      if(allLessonIds.length){
        const {data:progress,error:progressError}=await supabase
          .from('lesson_progress')
          .select('lesson_id,completed,completed_at,watched_seconds')
          .eq('student_id',user.id)
          .in('lesson_id',allLessonIds);
        if(progressError) throw progressError;
        progressRows=progress||[];
      }

      const progressByLesson=new Map(progressRows.map(row=>[row.lesson_id,row]));

      for(const item of items){
        const completedIds=new Set(
          (item._lessonIds||[]).filter(id=>progressByLesson.get(id)?.completed===true)
        );
        const allLessons=item.modules.flatMap(module=>module.lessons||[]);

        item.done=completedIds.size;
        item.progress=item.lessons?Math.min(100,Math.round(item.done/item.lessons*100)):0;
        item.nextLesson=allLessons.find(lesson=>!completedIds.has(lesson.id))||allLessons[allLessons.length-1]||null;
        item.modules=item.modules.map(module=>({
          ...module,
          lessons:(module.lessons||[]).map(lesson=>({
            ...lesson,
            completed:completedIds.has(lesson.id),
            progress:progressByLesson.get(lesson.id)||null
          }))
        }));
        delete item._lessonIds;
      }

      return publish(items);
    })();

    try{
      return await loadingPromise;
    }finally{
      loadingPromise=null;
    }
  }

  window.loadStudentCourses=loadStudentCourses;

  async function refresh(){
    try{
      await loadStudentCourses();
    }catch(e){
      console.error('[MissExplica] dados dos cursos:',e);
      publish([]);
    }
  }

  window.addEventListener('missexplica:auth-ready',refresh);
  window.addEventListener('missexplica:refresh-courses',refresh);
})();
