/* MissExplica — cursos reais do aluno. Substitui dados fictícios quando o Supabase estiver configurado. */
(function(){
  const supabase = window.missExplicaSupabase;
  window.loadStudentCourses = async function(){
    if(!supabase) return null;
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if(authError || !user) throw new Error('Sessão expirada. Entre novamente.');

    const { data, error } = await supabase
      .from('enrollments')
      .select('id,status,course_id,courses(id,title,description,published,modules(id,title,position,lessons(id,title,description,position,published,lesson_progress(student_id,completed,completed_at))))')
      .eq('student_id', user.id)
      .in('status',['active','completed']);

    if(error) throw error;

    return (data || []).map(enrollment => {
      const course = enrollment.courses || {};
      const modules = (course.modules || []).sort((a,b)=>(a.position||0)-(b.position||0));
      let total=0, completed=0;
      modules.forEach(module => (module.lessons||[]).forEach(lesson => {
        if(!lesson.published) return;
        total++;
        if((lesson.lesson_progress||[]).some(p=>p.student_id===user.id && p.completed)) completed++;
      }));
      return {
        enrollmentId: enrollment.id,
        status: enrollment.status,
        id: course.id,
        name: course.title || 'Curso',
        description: course.description || '',
        modules,
        lessons: total,
        done: completed,
        progress: total ? Math.round(completed/total*100) : 0
      };
    });
  };
})();
