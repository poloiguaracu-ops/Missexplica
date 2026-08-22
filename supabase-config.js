// CONFIGURAÇÃO DO SUPABASE
// Somente a URL e a chave pública podem ficar no GitHub/frontend.
// NUNCA coloque a service_role/Secret Key aqui.
window.MISSEXPLICA_SUPABASE = {
  url: 'https://wyzupmorgumjjwkxflda.supabase.co',
  anonKey: 'sb_publishable_Osn_-eTtrlY27-GJobmO8w_AUXHyMG9'
};

window.MISSEXPLICA_AUTH = {
  enabled: true,
  provider: 'supabase'
};

// Carrega a camada visual premium depois dos estilos principais.
(function loadMissExplicaPolish(){
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './ui-polish.css?v=1';
  document.head.appendChild(link);
})();
