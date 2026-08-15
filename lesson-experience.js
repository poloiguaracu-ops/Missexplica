/* MissExplica — experiência avançada de estudo: retomada, velocidade e atalhos. */
(function(){
 const key=(course,lesson)=>`missexplica.lesson.${course}.${lesson}`;
 function savePosition(course,lesson,seconds){localStorage.setItem(key(course,lesson),String(Math.max(0,Math.floor(seconds))));}
 function position(course,lesson){return Number(localStorage.getItem(key(course,lesson))||0);}
 function format(s){s=Math.max(0,Math.floor(s));return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
 function bind(root,courseId,lessonId){const video=root.querySelector('video');if(!video)return;const start=position(courseId,lessonId);video.addEventListener('loadedmetadata',()=>{if(start>5&&start<video.duration-10)video.currentTime=start});let timer;video.addEventListener('timeupdate',()=>{clearTimeout(timer);timer=setTimeout(()=>savePosition(courseId,lessonId,video.currentTime),800)});video.addEventListener('ended',()=>window.MissExplicaStudentProgress?.complete(lessonId));root.addEventListener('keydown',e=>{if(e.target.matches('input,textarea'))return;if(e.key===' '){e.preventDefault();video.paused?video.play():video.pause()}if(e.key==='ArrowRight')video.currentTime=Math.min(video.duration||Infinity,video.currentTime+10);if(e.key==='ArrowLeft')video.currentTime=Math.max(0,video.currentTime-10);});}
 window.MissExplicaLessonExperience={bind,savePosition,position,format};
})();
