/* MissExplica — camada única para dados reais do Supabase. */
(function(){
  const sb=()=>window.missExplicaSupabase;
  async function session(){const s=sb();if(!s) return null;const {data,error}=await s.auth.getSession();if(error) throw error;return data.session;}
  async function requireUser(){const s=await session();if(!s?.user) throw new Error('Sessão não encontrada. Faça login novamente.');return s.user;}
  async function profile(){const u=await requireUser();const {data,error}=await sb().from('profiles').select('id,full_name,role,active').eq('id',u.id).single();if(error) throw error;if(!data?.active) throw new Error('Conta desativada.');return data;}
  async function studentCourses(){const u=await requireUser();const {data,error}=await sb().from('enrollments').select('id,status,courses(id,title,description,published,modules(id,title,position,lessons(id,title,description,position,published)))').eq('student_id',u.id).in('status',['active','completed']);if(error) throw error;return (data||[]).map(e=>({...e,course:e.courses}));}
  async function completeLesson(lessonId){await requireUser();const {data,error}=await sb().rpc('student_complete_lesson',{target_lesson:lessonId});if(error) throw error;return data;}
  async function managerDashboard(){await requireUser();const {data,error}=await sb().rpc('manager_dashboard');if(error) throw error;return data;}
  async function managerEnroll(studentId,courseId){await requireUser();const {data,error}=await sb().rpc('admin_enroll_student',{target_student:studentId,target_course:courseId});if(error) throw error;return data;}
  async function managerRole(userId,role){await requireUser();const {data,error}=await sb().rpc('admin_set_user_role',{target_user:userId,new_role:role});if(error) throw error;return data;}
  window.MissExplicaData={session,profile,studentCourses,completeLesson,managerDashboard,managerEnroll,managerRole};
})();
