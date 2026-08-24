/* MissExplica — desktop productivity controls */
(function(){
  'use strict';
  if(window.__MISSEXPLICA_DESKTOP_CONTROLS__) return;
  window.__MISSEXPLICA_DESKTOP_CONTROLS__=true;
  const D=document;
  function isDesktop(){return window.innerWidth>=900}
  function addSearch(){
    if(!isDesktop()) return;
    const top=D.querySelector('.topbar'); if(!top||top.querySelector('.mx-desktop-search')) return;
    const wrap=D.createElement('div'); wrap.className='mx-desktop-search';
    wrap.innerHTML='<input type="search" id="mxDesktopSearch" aria-label="Pesquisar no ambiente" placeholder="Pesquisar cursos, aulas, alunos..." autocomplete="off"><span class="mx-shortcut-help"><kbd>Ctrl</kbd><kbd>K</kbd></span>';
    const anchor=top.querySelector('.breadcrumb')||top.firstElementChild;
    if(anchor) anchor.insertAdjacentElement('afterend',wrap); else top.prepend(wrap);
    const input=wrap.querySelector('input');
    input.addEventListener('input',()=>{
      const q=input.value.trim().toLocaleLowerCase();
      D.querySelectorAll('.course-card,.course-showcase article,.panel article,.table tbody tr').forEach(el=>{
        const hidden=!!q&&!el.textContent.toLocaleLowerCase().includes(q); el.hidden=hidden;
      });
    });
    input.addEventListener('keydown',e=>{if(e.key==='Escape'){input.value='';input.dispatchEvent(new Event('input'));input.blur()}});
  }
  function bindShortcuts(){
    if(D.__mxDesktopKeys)return;D.__mxDesktopKeys=true;
    D.addEventListener('keydown',e=>{
      if(!isDesktop())return;
      if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){
        e.preventDefault();const input=D.getElementById('mxDesktopSearch');if(input){input.focus();input.select()}
      }
      if(e.altKey&&e.key==='ArrowLeft'){
        const active=D.querySelector('.nav-btn.active');
        if(active){const nav=[...D.querySelectorAll('.nav-btn')],i=nav.indexOf(active);if(i>0)nav[i-1].click()}
      }
      if(e.altKey&&e.key==='ArrowRight'){
        const active=D.querySelector('.nav-btn.active');
        if(active){const nav=[...D.querySelectorAll('.nav-btn')],i=nav.indexOf(active);if(i>=0&&i<nav.length-1)nav[i+1].click()}
      }
    });
  }
  function init(){
    addSearch();bindShortcuts();
    new MutationObserver(()=>{if(isDesktop())addSearch()}).observe(D.body,{childList:true,subtree:true});
  }
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
