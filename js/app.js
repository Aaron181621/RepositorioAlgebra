// Coordinación de módulos; sin servidor ni dependencias de ejecución.
// Coordinación general de navegación, tema y descargas.
let redraw = () => {};

function readStore(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function downloadText(text, filename) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function navigate(page) {
  document.querySelectorAll('.tool-pane').forEach(panel => {
    panel.hidden = panel.id !== 'panel-' + page;
  });

  document.querySelectorAll('nav [data-page]').forEach(btn => {
    if (btn.dataset.page === page) {
      btn.setAttribute('aria-current', 'page');
    } else {
      btn.removeAttribute('aria-current');
    }
  });

  window.scrollTo(0, 0);
  document.getElementById('main').focus({ preventScroll: true });
  if (page === 'grafica') requestAnimationFrame(redraw);
}

document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('theme');

  function applyTheme(isDark) {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    themeBtn.setAttribute('aria-pressed', String(isDark));
    writeStore('linear-theme', isDark);
    redraw();
  }

  applyTheme(readStore('linear-theme', false));
  redraw = initGeometria();
  initSarrus();

  themeBtn.onclick = () => applyTheme(themeBtn.getAttribute('aria-pressed') !== 'true');
  document.querySelectorAll('[data-page]').forEach(btn => {
    btn.onclick = () => navigate(btn.dataset.page);
  });
});