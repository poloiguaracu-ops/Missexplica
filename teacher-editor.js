/* MissExplica — editor visual do professor. */
(function(){
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  async function ensure(){const p=await window.MissExplicaData.profile();if(!['teacher','manager'].includes(p.role))throw new Error('Acesso exclusivo para professores.');return p;}
  async function courses(){await ensure();return window.MissExplicaTeacher.loadCourses();}
  async function createModule(courseId,title){const {data,error}=await window.missExplicaSupabase.rpc('teacher_create_module',{target_course:courseId,module_title:title});if(error)throw error;return data;}
  async function createLesson(moduleId,title,description,video){const {data,error}=await window.missExplicaSupabase.rpc('teacher_create_lesson',{target_module:moduleId,lesson_title:title,lesson_description:description||'',lesson_video_url:video||''});if(error)throw error;return data;}
  async function publish(lessonId,value){const {data,error}=await window.missExplicaSupabase.rpc('teacher_publish_lesson',{target_lesson:lessonId,new_published:value});if(error)throw error;return data;}
  window.MissExplicaTeacherEditor={courses,createModule,createLesson,publish,esc};
})();
