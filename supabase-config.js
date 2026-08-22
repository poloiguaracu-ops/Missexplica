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
  var D=document;
  function load(){
    ['missexplica-functional-v37.js?v=1','missexplica-functional-v38.js?v=2','missexplica-functional-v39.js?v=2','missexplica-functional-v40.js?v=1','missexplica-functional-v42.js?v=1','missexplica-bugfix-v43.js?v=1','missexplica-functional-v44.js?v=1','missexplica-runtime-v45.js?v=1','missexplica-runtime-v46.js?v=1'].forEach(function(src){var s=D.createElement('script');s.src=src;s.defer=true;D.head.appendChild(s)});
  }
  if(D.readyState==='loading')D.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
