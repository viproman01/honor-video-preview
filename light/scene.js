'use strict';
const player = document.querySelector('video');
const playback = document.querySelector('.media');
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const panels = Array.from(document.querySelectorAll('[data-panel]'));
const names = {home:'Главная',login:'Вход',recover:'Восстановление доступа'};
let manual = null;
let hasVisitedHome = false;
function screen() {
  const selected = new URL(location.href).searchParams.get('screen');
  return Object.hasOwn(names, selected) ? selected : 'home';
}
function updatePlayback() {
  const enabled = manual ?? (hasVisitedHome && !motion.matches);
  if (enabled && !document.hidden) {
    if (!player.hasAttribute('src')) player.src = 'forest.mp4';
    if (player.paused) player.play().catch(renderButton);
  } else {
    player.pause();
  }
  renderButton();
}
function renderButton() {
  playback.textContent = player.paused ? 'Включить видео' : 'Пауза';
  playback.setAttribute('aria-label', player.paused ? 'Включить видео' : 'Приостановить видео');
}
function show(focusHeading) {
  const current = screen();
  hasVisitedHome ||= current === 'home';
  for (const panel of panels) {
    panel.hidden = panel.dataset.panel !== current;
    if (focusHeading && !panel.hidden) panel.querySelector('h1').focus({preventScroll:true});
  }
  document.title = 'HONOR · '+names[current];
  updatePlayback();
}
document.addEventListener('click', e => {
  const link = e.target.closest('a[data-screen]');
  if (!link || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  if (screen() === link.dataset.screen) return;
  history.pushState(null, '', link.href);
  show(true);
});
playback.addEventListener('click', () => {
  manual = player.paused;
  updatePlayback();
});
player.addEventListener('playing', renderButton);
player.addEventListener('pause', renderButton);
motion.addEventListener('change', () => { if (motion.matches) manual = null; updatePlayback(); });
document.addEventListener('visibilitychange', updatePlayback);
window.addEventListener('popstate', () => show(true));
show(false);
