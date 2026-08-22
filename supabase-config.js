// CONFIGURAÇÃO DO SUPABASE
// Somente a URL e a chave pública podem ficar no GitHub/frontend.
// NUNCA coloque a service_role/Secret Key aqui.
window.MISSEXPLICA_SUPABASE = {
  url: 'https://wyzupmorgumjjwkxflda.supabase.co',
  anonKey: 'sb_publishable_Osn_-eTtrlY27-GJobmO8w_AUXHyMG9'
};
window.MISSEXPLICA_AUTH = {enabled:true,provider:'supabase'};
(function(){['ui-polish.css?v=2','missexplica-v6.css?v=1','missexplica-v7.css?v=1','missexplica-v8.css?v=1','missexplica-v9.css?v=1','missexplica-v10.css?v=1','missexplica-v11.css?v=1','missexplica-v12.css?v=1','missexplica-v13.css?v=1','missexplica-v14.css?v=1'].forEach(function(href){var link=document.createElement('link');link.rel='stylesheet';link.href=href;document.head.appendChild(link);});})();
