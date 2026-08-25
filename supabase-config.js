// CONFIGURAÇÃO DO SUPABASE
// Somente a URL e a chave pública podem ficar no GitHub/frontend.
// NUNCA coloque a service_role/Secret Key aqui.
window.MISSEXPLICA_SUPABASE = {
  url: 'https://wyzupmorgumjjwkxflda.supabase.co',
  anonKey: 'sb_publishable_Osn_-eTtrlY27-GJobmO8w_AUXHyMG9'
};
window.MISSEXPLICA_AUTH = {enabled:true,provider:'supabase'};

// MissExplica — Phase 1 architecture entry point.
(function(){
  var styles = [
    'ui-polish.css?v=2',
    'missexplica-v6.css?v=1','missexplica-v7.css?v=1','missexplica-v8.css?v=1',
    'missexplica-v9.css?v=1','missexplica-v10.css?v=1','missexplica-v11.css?v=1','missexplica-v12.css?v=1',
    'missexplica-v13.css?v=1','missexplica-v14.css?v=1','missexplica-v15.css?v=1','missexplica-v16.css?v=1',
    'missexplica-v17.css?v=1','missexplica-v18.css?v=1','missexplica-v19.css?v=1','missexplica-v20.css?v=1',
    'missexplica-v21.css?v=1','missexplica-v22.css?v=1','missexplica-v23.css?v=1','missexplica-v24.css?v=1',
    'missexplica-v25.css?v=1','missexplica-v26.css?v=1','missexplica-v27.css?v=1','missexplica-v28.css?v=1',
    'missexplica-v29.css?v=1','missexplica-v30.css?v=1','missexplica-v31.css?v=1','missexplica-v32.css?v=1',
    'missexplica-v33.css?v=1','missexplica-v34.css?v=1','missexplica-v35.css?v=1','missexplica-v36.css?v=1',
    'missexplica-design-fixes.css?v=1','missexplica-desktop.css?v=1','missexplica-desktop-productivity.css?v=1','missexplica-desktop-workspace.css?v=1','missexplica-desktop-controls.css?v=1','missexplica-desktop-workspace-v2.css?v=1','missexplica-desktop-commandbar.css?v=1','missexplica-desktop-bugfixes.css?v=1','missexplica-header-button-fix.css?v=1','missexplica-header-button-final.css?v=1','missexplica-ui-safety.css?v=1','missexplica-desktop-interaction-fixes.css?v=1','missexplica-design-robustness.css?v=1','missexplica-student-only.css?v=2'
  ];
  styles.forEach(function(href){
    if(document.querySelector('link[href="'+href+'"]')) return;
    var link=document.createElement('link');
    link.rel='stylesheet';
    link.href=href;
    link.dataset.missexplicaCore='1';
    document.head.appendChild(link);
  });

  if(document.querySelector('script[src="missexplica-core.js"]')) return;
  var core=document.createElement('script');
  core.src='missexplica-core.js?v=1';
  core.defer=true;
  core.dataset.missexplicaCore='1';
  document.head.appendChild(core);

  var desktop=document.createElement('script');
  desktop.src='missexplica-desktop-controls.js?v=1';
  desktop.defer=true;
  desktop.dataset.missexplicaCore='1';
  document.head.appendChild(desktop);

  var commandbar=document.createElement('script');
  commandbar.src='missexplica-desktop-commandbar.js?v=1';
  commandbar.defer=true;
  commandbar.dataset.missexplicaCore='1';
  document.head.appendChild(commandbar);

  var studentOnly=document.createElement('script');
  studentOnly.src='missexplica-student-only.js?v=2';
  studentOnly.defer=true;
  studentOnly.dataset.missexplicaCore='1';
  document.head.appendChild(studentOnly);
})();
