/* MissExplica — AVA centrado no aluno, usando somente dados reais da conta. */
(function(){
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
 const oldRender=window.render;
 if(typeof oldRender!=='function')return;
 function courses(){try{return JSON.parse(localStorage.getItem('missexplica_real_courses')||'[]')}catch{return []}}
 function renderAVA(){
   const root=document.getElementById('pageContent');if(!root)return;
   const name=localStorage.getItem('missexplica_name')||'Aluno';
   const initial=name.split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase();
   const list=courses();
   const active=list.find(c=>c.progress<100)||list[0];
   const cards=list.slice(0,4);
   root.innerHTML=`<div class="student-ava-home"><section class="ava-welcome"><div><span class="ava-kicker">AMBIENTE VIRTUAL DE APRENDIZAGEM</span><h1>Olá, ${esc(name)}! 👋</h1><p>Continue seus estudos de onde parou.</p></div><div class="ava-avatar">${esc(initial)}</div></section>${active?`<section class="ava-continue"><div class="ava-section-label">CONTINUAR ESTUDANDO</div><div class="ava-continue-grid"><div><h2>${esc(active.name)}</h2><p>${active.done}/${active.lessons} aulas concluídas</p><div class="ava-progress"><i style="width:${active.progress}%"></i></div><small>${active.progress}% concluído</small></div><button class="ava-primary" data-page="courses">Continuar aula →</button></div></section>`:`<section class="ava-empty"><h2>Seus cursos aparecerão aqui</h2><p>Quando uma matrícula for liberada, você poderá começar seus estudos neste ambiente.</p><button class="ava-primary" data-page="courses">Ver meus cursos</button></section>`}<section class="ava-section"><div class="ava-section-head"><div><span>SEUS CURSOS</span><h2>Meus cursos</h2></div><button class="ava-link" data-page="courses">Ver todos →</button></div><div class="ava-courses">${cards.map(c=>`<article class="ava-course"><div class="ava-course-icon">ME</div><div><span>CURSO LIVRE</span><h3>${esc(c.name)}</h3><div class="ava-progress"><i style="width:${c.progress}%"></i></div><small>${c.progress}% • ${c.done}/${c.lessons} aulas</small></div><button class="ava-secondary" data-page="courses">Estudar</button></article>`).join('')||'<div class="ava-empty-inline">Nenhum curso liberado.</div>'}</div></section><section class="ava-section"><div class="ava-section-head"><div><span>PRÓXIMOS PASSOS</span><h2>Seu ambiente</h2></div></div><div class="ava-actions"><article data-page="courses"><b>▶️</b><div><strong>Meus cursos</strong><small>Acesse suas aulas e materiais.</small></div></article><article><b>📅</b><div><strong>Calendário acadêmico</strong><small>Prazos e aulas ao vivo.</small></div></article><article data-page="certificates"><b>🏆</b><div><strong>Certificados</strong><small>Veja suas certificações.</small></div></article><article data-page="messages"><b>💬</b><div><strong>Mensagens</strong><small>Fale com seus professores.</small></div></article></div></section></div>`;
   root.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{state.page=b.dataset.page;oldRender()});
 }
 window.render=function(){oldRender.apply(this,arguments);const role=localStorage.getItem('missexplica_role'),page=document.getElementById('pageTitle')?.textContent?.trim();if(role==='student'&&page==='Início')renderAVA()};
 window.addEventListener('missexplica:data-ready',()=>{if(localStorage.getItem('missexplica_role')==='student'&&document.getElementById('pageTitle')?.textContent?.trim()==='Início')renderAVA()});
})();
