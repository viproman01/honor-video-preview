'use strict';

const video = document.querySelector('[data-preview-video]');
const toggle = document.querySelector('[data-playback]');
const clips = [
  '../home/honor-hero.mp4',
  '../home/honor-hero-alternative.mp4',
  '../home/honor-hero-promo.mp4'
];
const motion = matchMedia('(prefers-reduced-motion: reduce)');
let index = 0;
let userPaused = false;
let optedIn = false;
let mediaFailed = false;
let attempt = 0;

function label() {
  const playing = !video.paused && !mediaFailed;
  toggle.textContent = playing ? 'Ⅱ' : '▶';
  toggle.setAttribute('aria-label', playing ? 'Приостановить фоновое видео' : 'Включить фоновое видео');
  toggle.setAttribute('aria-pressed', String(playing));
}

function failed() {
  mediaFailed = true;
  video.classList.remove('playing-frame');
  label();
}

function update() {
  const slot = ++attempt;
  if (document.hidden || userPaused || (motion.matches && !optedIn)) {
    video.pause();
    label();
    return;
  }
  if (mediaFailed) return;
  if (!video.getAttribute('src')) video.src = clips[index];
  video.play().catch(() => {
    if (slot === attempt && !video.paused) failed();
    label();
  });
}

video.addEventListener('playing', () => {
  video.classList.add('playing-frame');
  label();
});
video.addEventListener('pause', label);
video.addEventListener('error', failed);
video.addEventListener('ended', () => {
  if (document.hidden || userPaused || (motion.matches && !optedIn)) return;
  index = (index + 1) % clips.length;
  video.classList.remove('playing-frame');
  video.src = clips[index];
  update();
});
toggle.addEventListener('click', () => {
  userPaused = !video.paused;
  if (!userPaused) {
    optedIn = true;
    if (mediaFailed) { mediaFailed = false; video.load(); }
  }
  update();
});
document.addEventListener('visibilitychange', update);
motion.addEventListener('change', update);
update();
