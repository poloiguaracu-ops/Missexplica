/* MissExplica — Student Only Mode
   Removes the public landing experience and exposes only the student flow. */
(function () {
  'use strict';

  function qs(id) { return document.getElementById(id); }

  function applyStudentMode() {
    document.body.classList.add('missexplica-student-only');

    // Student-only means the public landing page is never an active screen.
    var landing = qs('landingScreen');
    if (landing) landing.remove();

    // Never retain a staff role in this interface mode.
    try { localStorage.setItem('missexplica_role', 'student'); } catch (_) {}

    // Prefer the real app render function when it exists.
    if (typeof window.render === 'function') {
      window.render();
      return;
    }

    var platform = qs('platform');
    var login = qs('loginScreen');
    var authenticated = false;
    try { authenticated = !!localStorage.getItem('missexplica_auth'); } catch (_) {}

    if (platform) platform.classList.toggle('hidden', !authenticated);
    if (login) login.classList.toggle('hidden', authenticated);
  }

  function installRenderGuard() {
    if (typeof window.render !== 'function' || window.__missexplicaStudentRenderGuard) return;
    var baseRender = window.render;
    window.render = function () {
      try { localStorage.setItem('missexplica_role', 'student'); } catch (_) {}
      return baseRender.apply(this, arguments);
    };
    window.__missexplicaStudentRenderGuard = true;
  }

  function start() {
    installRenderGuard();
    applyStudentMode();

    // Re-assert after authentication callbacks or legacy navigation handlers.
    window.setTimeout(applyStudentMode, 0);
    window.setTimeout(applyStudentMode, 250);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
