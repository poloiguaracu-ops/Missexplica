/* MissExplica — desktop command bar */
(function(){
  'use strict';
  if (window.__MISSEXPLICA_DESKTOP_COMMANDS__) return;
  window.__MISSEXPLICA_DESKTOP_COMMANDS__ = true;
  const D=document;
  const isDesktop=()=>window.matchMedia('(min-width: 900px)').matches;
  const getState=()=>{try{return typeof state!=='undefined'?state:null}catch{return null}};
  const getPage=()=>{const s=getState();return s?.page||'dashboard'};
  const NAV={dashboard:'Início',courses:'Cursos',content:'Conteúdo',enrollments:'Matrículas',messages:'Mensagens',certificates:'Certificados',settings:'Configurações'};
  function pageMatches(text){return (NAV[getPage()]||'').toLowerCase().includes(text.toLowerCase())}
  function navTo(label){
    const btn=[...D.querySelectorAll('.nav-btn,button,a')].find(x=>x.textContent.trim().toLowerCase().includes(label.toLowerCase()));
    if(btn){btn.click();return true}
    return false;
  }
  function open(){
    if(!isDesktop()) return;
    let root=D.getElementById('mx-commandbar');
    if(root){root.classList.add('open');setTimeout(()=>D.getElementById('mx-command-input')?.focus(),20);return}
    root=D.createElement('div');root.id='mx-commandbar';root.innerHTML='<div class="mx-command-overlay" data-close></div><section class="mx-command"><div class="mx-command-head"><div><strong>Ir para</strong><span>Digite uma área ou ação</span></div><button type="button" data-close aria-label="Fechar">Esc</button></div><input id="mx-command-input" autocomplete="off" placeholder="Ex.: cursos, mensagens, configurações"><div id="mx-command-results"></div><div class="mx-command-foot"><span><kbd>↑</kbd><kbd>↓</kbd> navegar</span><span><kbd>Enter</kbd> abrir</span><span><kbd>Esc</kbd> fechar</span></div></section>';
    D.body.appendChild(root);
    const input=root.querySelector('#mx-command-input'), results=root.querySelector('#mx-command-results');
    const items=Object.entries(NAV);
    let selected=0;
    function render(){
      const q=input.value.trim().toLowerCase();
      const filtered=items.filter(([k,v])=>(v+' '+k).toLowerCase().includes(q));
      selected=Math.max(0,Math.min(selected,Math.max(0,filtered.length-1)));
      results.innerHTML=filtered.map(([k,v],i)=>`<button class="mx-command-item ${i===selected?'selected':''}" data-page="${k}"><span>${v}</span><small>Alt+${i+1}</small></button>`).join('')||'<div class="mx-command-empty">Nenhum resultado.</div>';
      results.querySelectorAll('.mx-command-item').forEach((b,i)=>{b.onclick=()=>{navTo(b.textContent.trim());close()};b.onmouseenter=()=>{selected=i;render()}})
    }
    function close(){root.classList.remove('open');setTimeout(()=>root.remove(),140)}
    root.querySelectorAll('[data-close]').forEach(x=>x.addEventListener('click',close));
    input.addEventListener('input',()=>{selected=0;render()});
    input.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();close()}else if(e.key==='ArrowDown'){e.preventDefault();selected++;render()}else if(e.key==='ArrowUp'){e.preventDefault();selected--;render()}else if(e.key==='Enter'){e.preventDefault();const b=results.querySelectorAll('.mx-command-item')[selected];if(b){b.click()}}});
    render();root.classList.add('open');setTimeout(()=>input.focus(),20);
  }
  D.addEventListener('keydown',e=>{
    if(!isDesktop()) return;
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();open();return}
    if(e.key==='Escape'){const r=D.getElementById('mx-commandbar');if(r){r.classList.remove('open');setTimeout(()=>r.remove(),140)}}
  });
  window.MISSEXPLICA_DESKTOP_COMMANDS={open};
})();
