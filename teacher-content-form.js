/* MissExplica — formulário profissional de criação de aulas, sem prompts. */
(function(){
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const $=s=>document.querySelector(s);
  function open(moduleId){
    const old=$('#teacherLessonModal'); old?.remove();
    document.body.insertAdjacentHTML('beforeend',`<div id="teacherLessonModal" class="teacher-modal"><div class="teacher-modal-card"><button class="modal-close" id="closeTeacherModal">×</button><span class="section-tag">NOVA AULA</span><h2>Adicionar aula</h2><p>Prepare o conteúdo e salve como rascunho. Você poderá publicar depois.</p><form id="teacherLessonForm"><label>Título da aula<input name="title" maxlength="120" required placeholder="Ex.: Introdução ao Marketing"></label><label>Descrição<textarea name="description" maxlength="2000" rows="4" placeholder="Explique o que o aluno aprenderá nesta aula."></textarea></label><label>URL do vídeo <small>(opcional)</small><input name="video" type="url" placeholder="https://..."></label><div class="form-note">🔒 A aula será criada como <strong>rascunho</strong>.</div><div class="modal-actions"><button type="button" class="outline-btn" id="cancelTeacherModal">Cancelar</button><button class="green-btn" type="submit">Salvar aula</button></div><div id="teacherFormError" class="form-error"></div></form></div></div>`);
    const modal=$('#teacherLessonModal'); const close=()=>modal?.remove(); $('#closeTeacherModal').onclick=close; $('#cancelTeacherModal').onclick=close;
    $('#teacherLessonForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.currentTarget);const submit=e.currentTarget.querySelector('[type=submit]');submit.disabled=true;submit.textContent='Salvando...';try{await window.MissExplicaTeacherEditor.createLesson(moduleId,f.get('title'),f.get('description'),f.get('video'));close();window.dispatchEvent(new CustomEvent('teacher-content-changed'));}catch(err){$('#teacherFormError').textContent=err.message||'Não foi possível salvar.';submit.disabled=false;submit.textContent='Salvar aula';}};
  }
  window.MissExplicaTeacherForm={open};
})();
