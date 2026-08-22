/* MissExplica Core — single application entry point
 * Phase 1: architecture consolidation.
 * This file is intentionally behavior-preserving: it centralizes script loading,
 * prevents duplicate feature initialization, and gives us one place to evolve
 * the platform without changing the authentication/database contract.
 */
(function () {
  'use strict';

  if (window.__MISSEXPLICA_CORE__) return;
  window.__MISSEXPLICA_CORE__ = true;

  var scripts = [
    'missexplica-functional-v37.js?v=1',
    'missexplica-functional-v38.js?v=2',
    'missexplica-functional-v39.js?v=2',
    'missexplica-functional-v40.js?v=1',
    'missexplica-functional-v42.js?v=1',
    'missexplica-bugfix-v43.js?v=1',
    'missexplica-functional-v44.js?v=1',
    'missexplica-runtime-v45.js?v=1',
    'missexplica-runtime-v46.js?v=1'
  ];

  var loaded = Object.create(null);

  function loadScript(src) {
    if (loaded[src]) return Promise.resolve();
    loaded[src] = true;

    return new Promise(function (resolve, reject) {
      var script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.dataset.missexplicaCore = '1';
      script.onload = resolve;
      script.onerror = function () {
        console.error('[MissExplica] Falha ao carregar:', src);
        reject(new Error('Falha ao carregar ' + src));
      };
      document.head.appendChild(script);
    });
  }

  function start() {
    var chain = Promise.resolve();
    scripts.forEach(function (src) {
      chain = chain.then(function () { return loadScript(src); });
    });
    chain.catch(function (error) {
      console.error('[MissExplica] Core initialization error:', error);
    });
  }

  window.MISSEXPLICA_CORE = {
    version: '1.0.0',
    phase: 1,
    loadedModules: scripts.slice(),
    reloadModule: function (src) {
      delete loaded[src];
      return loadScript(src);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
