/* MissExplica — interface de ações do gestor. */
(function(){
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const $=s=>document.querySelector(s);
  function open(user,data){
    $('#managerActionModal')?.remove();
    const students=data.users.filter(x=>x.role==='student'), courses=data.courses;
    document.body.insertAdjacentHTML('beforeend',`<div id="managerActionModal" class="manager-modal"><div class="manager-modal-card"><button class="manager-close">×</button><span class="section-tag">ADMINISTRAÇÃO</span><h2>${esc(user.full_name||user.email)}</h2><p>Gerencie a função e o acesso deste usuário.</p><label>Função<select id="managerRole"><option value="student" ${user.role==='student'?'selected':''}>Aluno</option><option value="teacher" ${user.role==='teacher'?'selected':''}>Professor</option><option value="manager" ${user.role==='manager'?'selected':''}>Gestor</option></select></label><button id="saveRole" class="green-btn">Salvar função</button><hr><h3>Matricular em curso</h3><label>Curso<select id="managerCourse"><option value="">Selecione...</option>${courses.map(c=>`<option value="${c.id}">${esc(c.title)}</option>`).join('')}</select></label><button id="enrollStudent" class="outline-btn" ${user.role!=='student'?'disabled':''}>Matricular aluno</button><div id="managerActionError" class="form-error"></div></div></div>`);
    const close=()=>$('#managerActionModal')?.remove();$('.manager-close').onclick=close;
    $('#saveRole').onclick=async()=>{try{await window.MissExplicaManagerActions.setRole(user.id,$('#managerRole').value);close();window.dispatchEvent(new Event('manager-data-changed'))}catch(e){$('#managerActionError').textContent=e.message||'Não foi possível alterar a função.'}};
    $('#enrollStudent').onclick=async()=>{const course=$('#managerCourse').value;if(!course){$('#managerActionError').textContent='Selecione um curso.';return}try{await window.MissExplicaManagerActions.enroll(user.id,course);close();window.dispatchEvent(new Event('manager-data-changed'))}catch(e){$('#managerActionError').textContent=e.message||'Não foi possível matricular.'}};
  }
  window.MissExplicaManagerUI={open};
})();
