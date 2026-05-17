// Shared nav/footer renderer + server status + theme + i18n
const SERVER_IP = '158.220.89.78';
const BLUEMAP_URL = `http://${SERVER_IP}:8100`;

const NAV_KEYS = [
  { href: 'index.html',    key: 'nav.home' },
  { href: 'news.html',     key: 'nav.news' },
  { href: 'status.html',   key: 'nav.stats' },
  { href: 'download.html', key: 'nav.launcher' },
  { href: 'shop.html',     key: 'nav.shop' },
];

// ---- Theme ----
(function initTheme() {
  const saved = localStorage.getItem('vm_theme');
  const systemDark = matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = saved || (systemDark ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
})();

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  localStorage.setItem('vm_theme', next);
  document.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
}

function themeToggleHtml() {
  return `
    <button class="theme-toggle" onclick="toggleTheme()" aria-label="${t('theme.title')}" title="${t('theme.title')}">
      <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/></svg>
      <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    </button>`;
}

function langToggleHtml() {
  return `
    <button class="theme-toggle lang-toggle" onclick="toggleLang()" aria-label="${t('lang.title')}" title="${t('lang.title')}">${t('lang.toggle')}</button>`;
}

function renderNav(active) {
  const userNick = localStorage.getItem('vm_user');
  const links = NAV_KEYS.map(i =>
    `<a href="${i.href}" class="${i.href === active ? 'active' : ''}">${t(i.key)}</a>`
  ).join('');
  const action = userNick
    ? `<a href="account.html" class="btn btn-ghost">${userNick}</a>`
    : `<a href="account.html" class="btn btn-primary">${t('nav.login')}</a>`;
  return `
    <nav class="nav">
      <div class="container nav-inner">
        <a href="index.html" class="nav-brand">
          <span class="nav-brand-mark"><img src="assets/logo.png" alt=""></span>
          <span>voyage<em>M!</em></span>
        </a>
        <div class="nav-links">${links}</div>
        <div class="nav-actions">
          ${langToggleHtml()}
          ${themeToggleHtml()}
          ${action}
        </div>
      </div>
    </nav>`;
}

function renderFooter() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-inner">
          <div class="footer-about">
            <a href="index.html" class="nav-brand">
              <span class="nav-brand-mark"><img src="assets/logo.png" alt=""></span>
              <span>voyage<em>M!</em></span>
            </a>
            <p>${t('footer.about')}</p>
          </div>
          <div class="footer-cols">
            <div class="footer-col">
              <h5>${t('footer.project')}</h5>
              <a href="index.html">${t('footer.home')}</a>
              <a href="news.html">${t('footer.news')}</a>
              <a href="status.html">${t('footer.servers')}</a>
            </div>
            <div class="footer-col">
              <h5>${t('footer.player')}</h5>
              <a href="account.html">${t('footer.account')}</a>
              <a href="${BLUEMAP_URL}" target="_blank" rel="noopener noreferrer">${t('footer.map')}</a>
              <a href="shop.html">${t('nav.shop')}</a>
              <a href="download.html">${t('footer.launcher')}</a>
            </div>
            <div class="footer-col">
              <h5>${t('footer.contact')}</h5>
              <a href="#">Discord</a>
              <a href="#">Telegram</a>
              <a href="#">VK</a>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© 2026 voyageM!</span>
          <span>voyage<em>M!</em></span>
        </div>
      </div>
    </footer>`;
}

function mount(active) {
  const navHost = document.getElementById('nav-host');
  const footerHost = document.getElementById('footer-host');
  if (navHost) navHost.innerHTML = renderNav(active);
  if (footerHost) footerHost.innerHTML = renderFooter();
  if (typeof applyI18n === 'function') applyI18n();
}

async function fetchServerStatus() {
  try {
    const res = await fetch(`https://api.mcsrvstat.us/3/${SERVER_IP}`);
    return await res.json();
  } catch {
    return { online: false };
  }
}
