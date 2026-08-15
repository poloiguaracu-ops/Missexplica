/* MissExplica — dados reais do painel do gestor.
 * Este módulo apenas melhora a camada visual existente: os números são substituídos
 * pelo RPC protegido `manager_dashboard()` quando o Supabase estiver configurado.
 */
(function () {
  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  let busy = false;

  async function refreshManagerDashboard() {
    if (busy) return;
    if (localStorage.getItem('missexplica_role') !== 'manager') return;
    if (localStorage.getItem('missexplica_auth') !== 'true') return;
    if (!window.supabaseClient?.rpc) return;

    busy = true;
    try {
      const { data, error } = await window.supabaseClient.rpc('manager_dashboard');
      if (error || !data) return;

      const cards = document.querySelectorAll('#pageContent .stat-card strong');
      const values = [data.students, data.teachers, data.courses, data.enrollments];
      cards.forEach((card, i) => { if (values[i] !== undefined) card.textContent = values[i]; });

      const panel = [...document.querySelectorAll('#pageContent .panel')].find(p =>
        p.textContent.includes('Usuários') && p.querySelector('#userManager')
      );
      if (panel && Array.isArray(data.courses_detail)) {
        const target = panel.querySelector('#userManager');
        if (target) {
          target.innerHTML = `<div class="manager-course-list">${data.courses_detail.slice(0, 8).map(c => `
            <div class="course-card">
              <div class="course-cover">ME</div>
              <div class="course-info">
                <strong>${esc(c.title)}</strong>
                <span>${Number(c.students || 0)} aluno(s) matriculado(s) • ${c.published ? 'Publicado' : 'Rascunho'}</span>
              </div>
              <span class="course-chip">${c.published ? 'ATIVO' : 'RASCUNHO'}</span>
            </div>`).join('')}</div>` || '<div class="empty">Nenhum curso encontrado.</div>';
        }
      }
    } finally {
      busy = false;
    }
  }

  const observer = new MutationObserver(() => {
    if (document.querySelector('#pageContent .role-banner') &&
        document.querySelector('#pageContent .stat-card')) refreshManagerDashboard();
  });

  function start() {
    const target = document.getElementById('pageContent');
    if (target) observer.observe(target, { childList: true, subtree: true });
    refreshManagerDashboard();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
