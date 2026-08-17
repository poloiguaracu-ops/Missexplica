/* MissExplica — substitui a dashboard do aluno por um AVA centrado no estudante. */
(function(){
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
 const oldRender=window.render;
 if(typeof oldRender!=='function')return;
 window.render=function(){
   oldRender.apply(this,arguments);
   const role=localStorage.getItem('missexplica_role');
   const page=document.getElementById('pageTitle')?.textContent?.trim();
   if(role==='student'&&page==='Início') renderAVA();
 };
 function renderAVA(){
   const root=document.getElementById('pageContent');
   if(!root)return;
   const name=localStorage.getItem('missexplica_name')||'Aluno';
   const initial=name.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
   root.innerHTML=`<div class="student-ava-home"><section class="ava-welcome"><div><span class="ava-kicker">AMBIENTE VIRTUAL DE APRENDIZAGEM</span><h1>Olá, ${esc(name)}! 👋</h1><p>Continue seus estudos de onde parou.</p></div><div class="ava-avatar">${esc(initial)}</div></section><section class="ava-continue"><div class="ava-section-label">CONTINUAR ESTUDANDO</div><div class="ava-continue-grid"><div><h2>Introdução à Gestão</h2><p>Módulo 4 • Próxima aula: Comunicação profissional</p><div class="ava-progress"><i style="width:72%"></i></div><small>72% concluído • 9 de 12 aulas</small></div><button class="ava-primary" data-page="courses">Continuar aula →</button></div></section><section class="ava-section"><div class="ava-section-head"><div><span>SEUS CURSOS</span><h2>Meus cursos</h2></div><button class="ava-link" data-page="courses">Ver todos →</button></div><div class="ava-courses">${[['Introdução à Gestão',72,9,12],['Atendimento e Vendas',45,5,10],['Informática Essencial',100,16,16]].map(c=>`<article class="ava-course"><div class="ava-course-icon">ME</div><div><span>CURSO LIVRE</span><h3>${c[0]}</h3><div class="ava-progress"><i style="width:${c[1]}%"></i></div><small>${c[1]}% • ${c[2]}/${c[3]} aulas</small></div><button class="ava-secondary" data-page="courses">Estudar</button></article>`).join('')}</div></section><section class="ava-section"><div class="ava-section-head"><div><span>PRÓXIMOS PASSOS</span><h2>Atividades e agenda</h2></div></div><div class="ava-actions"><article><b>📝</b><div><strong>Atividade da Unidade 3</strong><small>Disponível para realizar</small></div></article><article><b>📅</b><div><strong>Calendário acadêmico</strong><small>Veja prazos e aulas ao vivo</small></div></article><article><b>🏆</b><div><strong>Certificados</strong><small>1 certificado disponível</small></div></article><article><b>💬</b><div><strong>Mensagens</strong><small>Fale com seus professores</small></div></article></div></section></div>`;
   root.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{state.page=b.dataset.page;oldRender();});
 }
})();
