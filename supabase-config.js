// CONFIGURAÇÃO DO SUPABASE
// Somente a URL e a chave pública podem ficar no GitHub/frontend.
// NUNCA coloque a service_role/Secret Key aqui.
window.MISSEXPLICA_SUPABASE = {
  url: 'https://wyzupmorgumjjwkxflda.supabase.co',
  anonKey: 'sb_publishable_Osn_-eTtrlY27-GJobmO8w_AUXHyMG9'
};
window.MISSEXPLICA_AUTH = {enabled:true,provider:'supabase'};
(function(){[
  'ui-polish.css?v=2','missexplica-v6.css?v=1','missexplica-v7.css?v=1','missexplica-v8.css?v=1',
  'missexplica-v9.css?v=1','missexplica-v10.css?v=1','missexplica-v11.css?v=1','missexplica-v12.css?v=1',
  'missexplica-v13.css?v=1','missexplica-v14.css?v=1','missexplica-v15.css?v=1','missexplica-v16.css?v=1',
  'missexplica-v17.css?v=1','missexplica-v18.css?v=1','missexplica-v19.css?v=1','missexplica-v20.css?v=1',
  'missexplica-v21.css?v=1','missexplica-v22.css?v=1','missexplica-v23.css?v=1','missexplica-v24.css?v=1',
  'missexplica-v25.css?v=1','missexplica-v26.css?v=1','missexplica-v27.css?v=1','missexplica-v28.css?v=1',
  'missexplica-v29.css?v=1','missexplica-v30.css?v=1','missexplica-v31.css?v=1','missexplica-v32.css?v=1',
  'missexplica-v33.css?v=1','missexplica-v34.css?v=1','missexplica-v35.css?v=1','missexplica-v36.css?v=1'
].forEach(function(href){var link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.appendChild(link);})();})();

(function(){
  'use strict';
  var D=document,W=window;
  var DRAFT_KEY='missexplica_teacher_draft_v1',PAGE_KEY='missexplica_last_page_v1',PROGRESS_KEY='missexplica_course_progress_v1';
  var ready=function(fn){if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',fn,{once:true});else fn();};
  var text=function(v){return String(v==null?'':v);};
  function toast(message,type){var old=D.querySelector('[data-mx-runtime-toast]');if(old)old.remove();var el=D.createElement('div');el.dataset.mxRuntimeToast='1';el.className='toast '+(type||'');el.textContent=message;Object.assign(el.style,{position:'fixed',right:'18px',bottom:'18px',zIndex:'9999',maxWidth:'min(380px,calc(100vw - 36px))',padding:'12px 15px',background:'#fff',border:'1px solid #dfe9e4',boxShadow:'0 14px 32px rgba(12,54,37,.12)',borderRadius:'13px',fontSize:'12px',fontWeight:'700'});D.body.appendChild(el);setTimeout(function(){el.remove();},2600)}
  function currentState(){try{return typeof state!=='undefined'?state:null}catch(e){return null}}
  function availableNavs(){try{return typeof navs!=='undefined'?navs:null}catch(e){return null}}
  function saveDraft(){var fields=['lessonTitleInput','moduleInput','lessonDescription','videoUrl'],data={};fields.forEach(function(id){var el=D.getElementById(id);if(el)data[id]=el.value});if(Object.keys(data).length){data.updatedAt=new Date().toISOString();localStorage.setItem(DRAFT_KEY,JSON.stringify(data))}}
  function restoreDraft(){var raw=localStorage.getItem(DRAFT_KEY);if(!raw)return;try{var data=JSON.parse(raw);['lessonTitleInput','moduleInput','lessonDescription','videoUrl'].forEach(function(id){var el=D.getElementById(id);if(el&&data[id]!=null&&!el.value)el.value=data[id]});if(data.updatedAt)toast('Rascunho restaurado automaticamente.','success')}catch(e){localStorage.removeItem(DRAFT_KEY)}}
  function wireDraft(){['lessonTitleInput','moduleInput','lessonDescription','videoUrl'].forEach(function(id){var el=D.getElementById(id);if(el&&!el.dataset.mxDraftBound){el.dataset.mxDraftBound='1';el.addEventListener('input',saveDraft);el.addEventListener('change',saveDraft)}});var save=D.getElementById('saveLesson');if(save&&!save.dataset.mxRuntimeBound){save.dataset.mxRuntimeBound='1';save.addEventListener('click',function(){saveDraft();toast('Rascunho salvo neste dispositivo.','success')})}restoreDraft()}
  function wirePagePersistence(){D.addEventListener('click',function(ev){var b=ev.target.closest&&ev.target.closest('[data-page]');if(b&&b.dataset.page)localStorage.setItem(PAGE_KEY,b.dataset.page)},true);var s=currentState(),n=availableNavs(),saved=localStorage.getItem(PAGE_KEY);if(s&&n&&Array.isArray(n[s.role])&&n[s.role].some(function(x){return x[0]===saved}))s.page=saved}
  function wireCourseSearch(){var s=currentState();if(!s||s.role!=='student'||s.page!=='courses')return;var list=D.querySelector('.course-list');if(!list||D.getElementById('mxCourseSearch'))return;var box=D.createElement('div');box.className='panel';box.style.marginBottom='14px';box.innerHTML='<label for="mxCourseSearch"><strong>Buscar curso</strong></label><input id="mxCourseSearch" type="search" placeholder="Digite o nome do curso..." autocomplete="off">';list.parentNode.insertBefore(box,list);var input=box.querySelector('input');input.addEventListener('input',function(){var q=text(input.value).trim().toLowerCase();list.querySelectorAll('.course-card').forEach(function(card){card.hidden=q&&!text(card.textContent).toLowerCase().includes(q)})})}
  function wireProgress(){var btn=D.getElementById('completeLesson');if(!btn||btn.dataset.mxProgressBound)return;btn.dataset.mxProgressBound='1';btn.addEventListener('click',function(){try{var heading=D.querySelector('.course-room-head h1'),name=heading?text(heading.textContent):'';if(!name)return;var saved=JSON.parse(localStorage.getItem(PROGRESS_KEY)||'{}');saved[name]={completed:true,updatedAt:new Date().toISOString()};localStorage.setItem(PROGRESS_KEY,JSON.stringify(saved));toast('Aula concluída e progresso salvo neste dispositivo.','success')}catch(e){}},true)}
  function wireNetwork(){var id='mxNetworkStatus';if(D.getElementById(id))return;var el=D.createElement('div');el.id=id;el.setAttribute('aria-live','polite');Object.assign(el.style,{display:'none',position:'fixed',left:'50%',bottom:'18px',transform:'translateX(-50%)',zIndex:'9998',padding:'9px 14px',borderRadius:'999px',fontSize:'11px',fontWeight:'800',background:'#fffaf0',border:'1px solid #ead9ad',color:'#6a5420',boxShadow:'0 10px 24px rgba(70,50,10,.1)'});D.body.appendChild(el);function update(){var off=!navigator.onLine;el.textContent=off?'Você está offline. Alterações locais continuam disponíveis.':'';el.style.display=off?'block':'none';if(!off)toast('Conexão restaurada.','success')}W.addEventListener('offline',update);W.addEventListener('online',update);update()}
  function wireShortcuts(){D.addEventListener('keydown',function(ev){if(ev.ctrlKey||ev.metaKey)return;if(ev.key==='Escape'){var l=D.getElementById('loginScreen');if(l&&!l.classList.contains('hidden')&&typeof W.backLanding==='function')W.backLanding()}},false);W.addEventListener('beforeunload',function(){if(D.getElementById('lessonTitleInput')||D.getElementById('lessonDescription'))saveDraft()})}
  function observe(){var target=D.getElementById('pageContent');if(!target||target.dataset.mxObserved)return;target.dataset.mxObserved='1';new MutationObserver(function(){setTimeout(function(){wireDraft();wireCourseSearch();wireProgress()},20)}).observe(target,{childList:true,subtree:true})}
  ready(function(){wirePagePersistence();wireNetwork();wireShortcuts();observe();setTimeout(function(){wireDraft();wireCourseSearch();wireProgress()},80)})
})();
