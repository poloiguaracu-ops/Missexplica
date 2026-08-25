/* MissExplica — Student Only Mode
   Public landing is disabled; unauthenticated users see the login,
   authenticated users go directly to the student AVA. */
(function () {
  'use strict';

  function qs(id) { return document.getElementById(id); }

  function isAuthenticated() {
    try { return !!localStorage.getItem('missexplica_auth'); } catch (_) { return false; }
  }

  function showStudentFlow() {
    document.body.classList.add('missexplica-student-only');

    var landing = qs('landingScreen');
    var login = qs('loginScreen');
    var platform = qs('platform');

    // Never remove structural screens here: legacy handlers may still need them.
    // We only control which screen is visible.
    if (landing) landing.classList.add('hidden');

    try { localStorage.setItem('missexplica_role', 'student'); } catch (_) {}

    if (isAuthenticated()) {
      if (login) login.classList.add('hidden');
      if (platform) platform.classList.remove('hidden');
      if (typeof window.render === 'function') window.render();
    } else {
      if (platform) platform.classList.add('hidden');
      if (login) login.classList.remove('hidden');
    }
  }

  function installRenderGuard() {
    if (typeof window.render !== 'function' || window.__missexplicaStudentRenderGuard) return;
    var baseRender = window.render;
    window.render = function () {
      try { localStorage.setItem('missexplica_role', 'student'); } catch (_) {}
      var result = baseRender.apply(this, arguments);
      // The legacy renderer hides the platform when unauthenticated. In student-only
      // mode that must mean "show login", never "show nothing".
      if (!isAuthenticated()) {
        var login = qs('loginScreen');
        var platform = qs('platform');
        if (platform) platform.classList.add('hidden');
        if (login) login.classList.remove('hidden');
      }
      return result;
    };
    window.__missexplicaStudentRenderGuard = true;
  }

  function start() {
    installRenderGuard();
    showStudentFlow();
    window.setTimeout(showStudentFlow, 0);
    window.setTimeout(showStudentFlow, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
