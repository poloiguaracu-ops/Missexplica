/* MissExplica — dados reais do painel do gestor. */
(function () {
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  let busy = false;
  let refreshTimer = null;

  const getClient = () => window.missexplicaSupabase || window.supabaseClient || null;

  async function refreshManagerDashboard() {
    if (busy) return;
    if (localStorage.getItem('missexplica_role') !== 'manager') return;
    if (localStorage.getItem('missexplica_auth') !== 'true') return;

    const client = getClient();
    if (!client?.rpc) return;

    busy = true;
    try {
      const { data, error } = await client.rpc('manager_dashboard');
      if (error || !data) return;

      const cards = document.querySelectorAll('#pageContent .stat-card strong');
      const values = [data.students, data.teachers, data.courses, data.enrollments];
      cards.forEach((card, i) => { if (values[i] !== undefined) card.textContent = String(values[i]); });

      const target = document.querySelector('#pageContent #userManager');
      if (!target) return;

      const details = Array.isArray(data.courses_detail) ? data.courses_detail.slice(0, 8) : [];
      target.innerHTML = details.length
        ? `<div class="manager-course-list">${details.map(c => `<div class="course-card"><div class="course-cover">ME</div><div class="course-info"><strong>${esc(c.title)}</strong><span>${Number(c.students || 0)} aluno(s) matriculado(s) • ${c.published ? 'Publicado' : 'Rascunho'}</span></div><span class="course-chip">${c.published ? 'ATIVO' : 'RASCUNHO'}</span></div>`).join('')}</div>`
        : '<div class="empty">Nenhum curso encontrado.</div>';
    } finally {
      busy = false;
    }
  }

  function scheduleRefresh() {
    clearTimeout(refreshTimer);
    refreshTimer = setTimeout(refreshManagerDashboard, 120);
  }

  const observer = new MutationObserver(scheduleRefresh);

  function start() {
    const target = document.getElementById('pageContent');
    if (target) observer.observe(target, { childList: true, subtree: true });
    window.addEventListener('missexplica:auth-ready', scheduleRefresh);
    scheduleRefresh();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
