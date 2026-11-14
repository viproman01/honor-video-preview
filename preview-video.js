(function () {
  const clips = {
    original: ['Лес и горы', '/honor-video-preview/home/honor-hero.mp4'],
    alternative: ['Каменистый маршрут', '/honor-video-preview/home/honor-hero-alternative.mp4'],
    promo: ['Горная экспедиция', '/honor-video-preview/home/honor-hero-promo.mp4'],
  };
  const playlist = Object.keys(clips);
  document.querySelectorAll('form').forEach(form => form.addEventListener('submit', event => event.preventDefault()));
  document.querySelectorAll('a[aria-disabled=true]').forEach(link => link.addEventListener('click', event => event.preventDefault()));

  const requested = new URLSearchParams(location.search).get('heroVideo');
  let selected = playlist.includes(requested) ? requested : playlist[0];
  const desktop = matchMedia('(min-width: 64rem)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const videos = [...document.querySelectorAll('video[data-hero-video]')];
  let manualPause = null;
  let revision = 0;

  const controls = document.createElement('div');
  controls.style.cssText = 'position:fixed;right:16px;bottom:16px;z-index:1000;display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(0,0,0,.82);border:1px solid #ffffff55;border-radius:8px;color:white;font:12px system-ui;max-width:calc(100vw - 32px)';
  const label = document.createElement('label');
  label.textContent = 'Фоновое видео ';
  const select = document.createElement('select');
  select.setAttribute('aria-label', 'Фоновое видео');
  select.style.cssText = 'background:#111;color:white;border:1px solid #ffffff66;padding:5px;border-radius:4px;max-width:180px';
  for (const key of playlist) select.add(new Option(clips[key][0], key));
  label.append(select);
  controls.append(label);
  const button = document.createElement('button');
  button.type = 'button';
  button.style.cssText = 'background:transparent;color:white;border:1px solid #ffffff66;border-radius:5px;padding:6px;cursor:pointer';
  controls.append(button);
  document.body.append(controls);

  function paused() {
    return manualPause ?? reducedMotion.matches;
  }

  function isActive(video) {
    return video.dataset.heroVideo === (desktop.matches ? 'desktop' : 'mobile');
  }

  function updateButton() {
    button.textContent = paused() ? 'Воспроизвести' : 'Пауза';
    button.setAttribute('aria-label', paused() ? 'Включить фоновое видео' : 'Приостановить фоновое видео');
  }

  function update() {
    const attempt = ++revision;
    select.value = selected;
    updateButton();
    for (const video of videos) {
      if (!isActive(video) || paused() || document.hidden) {
        video.pause();
        continue;
      }
      if (video.getAttribute('src') !== clips[selected][1]) {
        video.src = clips[selected][1];
        video.load();
      }
      video.style.objectPosition = desktop.matches && selected === 'original' ? 'center 28%' : 'center';
      video.play().catch(error => {
        if (attempt !== revision || error.name === 'AbortError') return;
        manualPause = true;
        updateButton();
      });
    }
  }

  for (const video of videos) {
    video.loop = false;
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.addEventListener('playing', () => { video.style.opacity = '1'; });
    video.addEventListener('ended', () => {
      if (!isActive(video) || paused() || document.hidden || video.getAttribute('src') !== clips[selected][1]) return;
      selected = playlist[(playlist.indexOf(selected) + 1) % playlist.length];
      update();
    });
  }

  select.addEventListener('change', () => {
    selected = select.value;
    const url = new URL(location.href);
    url.searchParams.set('heroVideo', selected);
    history.replaceState({}, '', url);
    update();
  });
  button.addEventListener('click', () => {
    manualPause = !paused();
    update();
  });
  desktop.addEventListener('change', update);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches && manualPause === false) manualPause = null;
    update();
  });
  document.addEventListener('visibilitychange', update);
  update();
})();
