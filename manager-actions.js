/* MissExplica — ações do gestor com autorização no banco. */
(function(){
  async function setRole(userId,role){const {error}=await window.missExplicaSupabase.rpc('manager_set_role',{target_user:userId,new_role:role});if(error)throw error;return true}
  async function enroll(studentId,courseId){const {data,error}=await window.missExplicaSupabase.rpc('manager_enroll_student',{target_student:studentId,target_course:courseId});if(error)throw error;return data}
  window.MissExplicaManagerActions={setRole,enroll};
})();
