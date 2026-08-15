/* MissExplica — anotações privadas por aula. */
(function(){
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function load(course,lesson){return localStorage.getItem(`missexplica.note.${course}.${lesson}`)||''}
 function save(course,lesson,text){localStorage.setItem(`missexplica.note.${course}.${lesson}`,text);}
 function mount(root,course,lesson){root.innerHTML=`<aside class="student-notes"><div><strong>📝 Minhas anotações</strong><span>Privadas</span></div><textarea id="lessonNote" maxlength="5000" placeholder="Anote pontos importantes desta aula..."></textarea><small id="noteSaved">Salvo neste dispositivo</small></aside>`;const ta=root.querySelector('#lessonNote');ta.value=load(course,lesson);let timer;ta.oninput=()=>{clearTimeout(timer);timer=setTimeout(()=>save(course,lesson,ta.value),400)};}
 window.MissExplicaStudentNotes={load,save,mount};
})();
