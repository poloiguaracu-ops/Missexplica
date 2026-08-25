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

    // The public landing is disabled in student-only mode.
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

  function studentBack() {
    // Legacy code calls this function "backLanding". The landing page no longer
    // exists in the student-only flow, so the action returns to the correct
    // student screen instead of revealing a blank/hidden landing page.
    showStudentFlow();
    window.scrollTo(0, 0);
  }

  function installRenderGuard() {
    if (typeof window.render !== 'function' || window.__missexplicaStudentRenderGuard) return;
    var baseRender = window.render;
    window.render = function () {
      try { localStorage.setItem('missexplica_role', 'student'); } catch (_) {}
      var result = baseRender.apply(this, arguments);
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

  function installBackHandler() {
    // Override the legacy global handler used by the login screen.
    window.backLanding = studentBack;

    // Also repair existing buttons that still carry the old inline handler.
    document.querySelectorAll('[onclick*="backLanding"]').forEach(function (button) {
      button.onclick = studentBack;
      button.removeAttribute('onclick');
      button.setAttribute('aria-label', 'Voltar para o acesso do aluno');
    });
  }

  function start() {
    installRenderGuard();
    installBackHandler();
    showStudentFlow();
    window.setTimeout(installBackHandler, 0);
    window.setTimeout(showStudentFlow, 0);
    window.setTimeout(installBackHandler, 250);
    window.setTimeout(showStudentFlow, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
