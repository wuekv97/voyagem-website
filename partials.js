// Shared nav/footer renderer + server status + theme + i18n
const SERVER_IP = '158.220.89.78';
const BLUEMAP_URL = `http://${SERVER_IP}:8100`;
const DISCORD_URL = 'https://discord.gg/voyagem';

const NAV_KEYS = [
  { href: '/',       key: 'nav.home' },
  { href: '/leaderboard', key: 'nav.leaderboard' },
  { href: '/docs',        key: 'nav.docs' },
  { href: '/referrals',   key: 'nav.referrals' },
  { href: '/download',    key: 'nav.launcher' },
  { href: '/shop',        key: 'nav.shop' },
  { href: '/topup',       key: 'nav.topup' },
];

// ---- Theme (light/dark) ----
// Initial theme is set by the inline <head> script (reads localStorage 'vm_theme'
// or falls back to prefers-color-scheme). This only handles toggling at runtime.
function toggleTheme() {
  const root = document.documentElement;
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('vm_theme', next); } catch (e) {}
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: next } }));
}

function themeToggleHtml() {
  return `
    <button class="theme-toggle" onclick="toggleTheme()" aria-label="${t('theme.title')}" title="${t('theme.title')}">
      <svg class="theme-icon-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>
      <svg class="theme-icon-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
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
    ? `<a href="/account" class="btn btn-ghost">${userNick}</a>`
    : `<a href="/account" class="btn btn-primary">${t('nav.login')}</a>`;
  // Mobile overlay menu links (Oswald uppercase, stacked)
  const mLinks = NAV_KEYS.map(i =>
    `<a href="${i.href}" class="${i.href === active ? 'active' : ''}" onclick="closeMobileNav()">${t(i.key)}</a>`
  ).join('');
  const mAction = userNick
    ? `<a href="/account" class="btn btn-ghost btn-lg" onclick="closeMobileNav()">${userNick}</a>`
    : `<a href="/account" class="btn btn-primary btn-lg" onclick="closeMobileNav()">${t('nav.login')}</a>`;
  return `
    <nav class="nav">
      <div class="container nav-inner">
        <a href="/" class="nav-brand">
          <span class="nav-brand-mark"><img src="assets/mark.png" alt="" style="image-rendering: pixelated"></span>
          <span>voyage<em>M!</em></span>
        </a>
        <div class="nav-links">${links}</div>
        <div class="nav-actions">
          ${langToggleHtml()}
          ${action}
          <button class="nav-burger" onclick="openMobileNav()" aria-label="Menu" aria-expanded="false">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </nav>
    <div class="mobile-nav" id="mobile-nav" aria-hidden="true">
      <button class="mobile-nav-close" onclick="closeMobileNav()" aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square"><path d="M5 5l14 14M19 5L5 19"/></svg>
      </button>
      <nav class="mobile-nav-links">${mLinks}</nav>
      <div class="mobile-nav-action">
        ${mAction}
      </div>
    </div>`;
}

function openMobileNav() {
  const m = document.getElementById('mobile-nav');
  if (!m) return;
  m.classList.add('is-open');
  m.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  const b = document.querySelector('.nav-burger');
  if (b) b.setAttribute('aria-expanded', 'true');
}
function closeMobileNav() {
  const m = document.getElementById('mobile-nav');
  if (!m) return;
  m.classList.remove('is-open');
  m.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  const b = document.querySelector('.nav-burger');
  if (b) b.setAttribute('aria-expanded', 'false');
}
// Close overlay if viewport grows back to desktop
window.addEventListener('resize', () => {
  if (window.innerWidth > 920) closeMobileNav();
});

function renderFooter() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-inner">
          <div class="footer-about">
            <a href="/" class="nav-brand">
              <span class="nav-brand-mark"><img src="assets/mark.png" alt="" style="image-rendering: pixelated"></span>
              <span>voyage<em>M!</em></span>
            </a>
            <p>${t('footer.about')}</p>
          </div>
          <div class="footer-cols">
            <div class="footer-col">
              <h5>${t('footer.project')}</h5>
              <a href="/">${t('footer.home')}</a>
              <a href="/news">${t('footer.news')}</a>
              <a href="/status">${t('footer.servers')}</a>
            </div>
            <div class="footer-col">
              <h5>${t('footer.player')}</h5>
              <a href="/account">${t('footer.account')}</a>
              <a href="/shop">${t('nav.shop')}</a>
              <a href="/download">${t('footer.launcher')}</a>
            </div>
            <div class="footer-col">
              <h5>${t('footer.contact')}</h5>
              <a href="${DISCORD_URL}" target="_blank" rel="noopener noreferrer">Discord</a>
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
  // Move the mobile overlay to <body> so it escapes the nav-host stacking
  // context and reliably paints above page content.
  const mob = document.getElementById('mobile-nav');
  if (mob && mob.parentElement !== document.body) document.body.appendChild(mob);
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
