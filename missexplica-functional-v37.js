/* MissExplica Functional V37 — independent functionality layer */
(function(){
  'use strict';
  const KEY='missexplica_v37_state';
  const safeParse=(v,f)=>{try{return JSON.parse(v)||f}catch{return f}};
  const load=()=>safeParse(localStorage.getItem(KEY),{lastPage:'dashboard',lastCourse:null,history:[],bookmarks:[],preferences:{}});
  const save=s=>localStorage.setItem(KEY,JSON.stringify(s));
  let state=load();
  const toast=(message,type='info')=>{
    let el=document.getElementById('mx-v37-toast');
    if(!el){el=document.createElement('div');el.id='mx-v37-toast';el.setAttribute('role','status');el.setAttribute('aria-live','polite');document.body.appendChild(el)}
    el.textContent=message;el.dataset.type=type;el.className='mx-v37-toast-show';
    clearTimeout(toast.t);toast.t=setTimeout(()=>{el.className=''},2600);
  };
  const remember=()=>{
    const page=document.querySelector('#pageTitle')?.textContent||'Início';
    state.lastPage=page;
    state.history=[page,...(state.history||[]).filter(x=>x!==page)].slice(0,8);
    save(state);
  };
  const injectStyles=()=>{
    if(document.getElementById('mx-v37-style'))return;
    const s=document.createElement('style');s.id='mx-v37-style';s.textContent=`
      #mx-v37-toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,18px);opacity:0;pointer-events:none;z-index:9999;padding:11px 15px;border-radius:12px;background:#14251d;color:#fff;font:700 12px/1.3 Inter,system-ui,sans-serif;box-shadow:0 14px 30px rgba(0,0,0,.18);transition:opacity .18s,transform .18s}
      #mx-v37-toast.mx-v37-toast-show{opacity:1;transform:translate(-50%,0)}
      #mx-v37-toast[data-type="success"]{background:#0a6b46}#mx-v37-toast[data-type="error"]{background:#8f2f2f}
      .mx-v37-tools{display:flex;gap:8px;align-items:center;margin:0 0 14px}.mx-v37-tools input{flex:1;min-width:160px}.mx-v37-kbd{font:700 10px/1.2 system-ui;padding:3px 6px;border:1px solid #d8e4dd;border-bottom-width:2px;border-radius:5px;background:#fff;color:#607169}
      .mx-v37-bookmark{margin-left:auto;min-width:36px!important}.mx-v37-pinned{box-shadow:0 0 0 3px rgba(23,185,120,.10),0 8px 26px rgba(12,54,37,.08)!important}
      @media(max-width:560px){.mx-v37-tools{display:block}.mx-v37-tools input{width:100%;margin-bottom:6px}}
    `;document.head.appendChild(s);
  };
  const enhanceCourses=()=>{
    const list=document.querySelector('.course-list');
    if(!list||list.dataset.v37==='1')return;
    const cards=[...list.querySelectorAll('.course-card')];if(!cards.length)return;
    list.dataset.v37='1';
    const tools=document.createElement('div');tools.className='mx-v37-tools';tools.innerHTML='<input aria-label="Buscar curso" placeholder="Buscar curso..." autocomplete="off"><span class="mx-v37-kbd">Ctrl K</span>';
    list.parentElement.insertBefore(tools,list);
    const input=tools.querySelector('input');
    input.oninput=()=>{const q=input.value.trim().toLocaleLowerCase();cards.forEach(c=>{c.hidden=q&&!c.textContent.toLocaleLowerCase().includes(q)})};
    cards.forEach(c=>{
      if(c.querySelector('.mx-v37-bookmark'))return;
      const b=document.createElement('button');b.type='button';b.className='action mx-v37-bookmark';b.title='Salvar curso';b.textContent='☆';
      b.onclick=()=>{const name=c.querySelector('strong')?.textContent?.trim()||'Curso';const i=state.bookmarks.indexOf(name);if(i>=0){state.bookmarks.splice(i,1);b.textContent='☆';c.classList.remove('mx-v37-pinned');toast('Curso removido dos salvos')}else{state.bookmarks.push(name);b.textContent='★';c.classList.add('mx-v37-pinned');toast('Curso salvo','success')}save(state)};
      c.appendChild(b);
      const name=c.querySelector('strong')?.textContent?.trim();if(name&&state.bookmarks.includes(name)){b.textContent='★';c.classList.add('mx-v37-pinned')}
    });
  };
  const enhanceNavigation=()=>{
    document.querySelectorAll('[data-page]').forEach(el=>{
      if(el.dataset.v37==='1')return;el.dataset.v37='1';
      el.addEventListener('click',()=>setTimeout(()=>{remember();},0));
    });
  };
  const globalKeys=e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();const i=document.querySelector('.mx-v37-tools input');if(i)i.focus();}
    if(e.key==='Escape'){const i=document.querySelector('.mx-v37-tools input');if(document.activeElement===i){i.value='';i.dispatchEvent(new Event('input'));i.blur();}}
    if((e.altKey||e.metaKey)&&e.key==='ArrowLeft'){e.preventDefault();const back=document.querySelector('#backCourses');if(back)back.click();}
  };
  const monitorErrors=()=>{
    window.addEventListener('error',e=>toast('Ocorreu um erro inesperado. Tente novamente.','error'));
    window.addEventListener('unhandledrejection',()=>toast('Uma operação não pôde ser concluída.','error'));
  };
  const observe=()=>{
    const target=document.getElementById('pageContent')||document.body;
    const mo=new MutationObserver(()=>{enhanceCourses();enhanceNavigation();remember()});mo.observe(target,{childList:true,subtree:true});
  };
  const init=()=>{injectStyles();document.addEventListener('keydown',globalKeys);monitorErrors();enhanceNavigation();enhanceCourses();observe();remember();window.addEventListener('beforeunload',()=>save(state));
    if(navigator.onLine===false)toast('Você está offline. Alterações locais continuam disponíveis.','error');
    window.addEventListener('online',()=>toast('Conexão restaurada.','success'));window.addEventListener('offline',()=>toast('Você ficou offline.','error'));
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
