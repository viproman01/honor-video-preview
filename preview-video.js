(function () {
  const clips={original:['Лес и горы','/honor-video-preview/home/honor-hero.mp4'],promo:['Горная экспедиция','/honor-video-preview/home/honor-hero-promo.mp4'],alternative:['Каменистый маршрут','/honor-video-preview/home/honor-hero-alternative.mp4']};
  document.querySelectorAll('form').forEach(f=>f.addEventListener('submit',e=>e.preventDefault()));
  document.querySelectorAll('a[aria-disabled=true]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()));
  let selected=new URLSearchParams(location.search).get('heroVideo');
  if (!clips[selected]) selected='original';
  let paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const videos=[...document.querySelectorAll('video[data-hero-video]')];
  const controls=document.createElement('div');
  controls.style.cssText='position:fixed;right:16px;bottom:16px;z-index:1000;display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(0,0,0,.82);border:1px solid #ffffff55;border-radius:8px;color:white;font:12px system-ui;max-width:calc(100vw - 32px)';
  const label=document.createElement('label');label.textContent='Фоновое видео ';
  const select=document.createElement('select');select.setAttribute('aria-label','Фоновое видео');
  select.style.cssText='background:#111;color:white;border:1px solid #ffffff66;padding:5px;border-radius:4px;max-width:180px';
  Object.entries(clips).forEach(([value,[text]])=>{const option=new Option(text,value);select.add(option);});
  select.value=selected;label.append(select);controls.append(label);
  const button=document.createElement('button');button.type='button';button.style.cssText='background:transparent;color:white;border:1px solid #ffffff66;border-radius:5px;padding:6px;cursor:pointer';controls.append(button);document.body.append(controls);
  function update() {
    const desktop=matchMedia('(min-width: 64rem)').matches;
    for (const video of videos) {
      const active=(video.dataset.heroVideo==='desktop')===desktop;
      video.muted=true;video.defaultMuted=true;video.loop=true;video.playsInline=true;
      if (!active || paused || document.hidden) {video.pause();continue;}
      if (video.getAttribute('src')!==clips[selected][1]) {video.src=clips[selected][1];video.load();}
      video.style.objectPosition=desktop&&selected==='original'?'center 28%':'center';
      video.play().catch(()=>{button.textContent='Воспроизвести';});
    }
    button.textContent=paused?'Воспроизвести':'Пауза';
    button.setAttribute('aria-label',paused?'Включить фоновое видео':'Приостановить фоновое видео');
  }
  videos.forEach(video=>video.addEventListener('playing',()=>{video.style.opacity=video.dataset.heroVideo==='desktop'?'1':'.65';}));
  select.addEventListener('change',()=>{selected=select.value;const u=new URL(location.href);u.searchParams.set('heroVideo',selected);history.replaceState({},'',u);update();});
  button.addEventListener('click',()=>{paused=!paused;update();});
  matchMedia('(min-width: 64rem)').addEventListener('change',update);
  document.addEventListener('visibilitychange',update);
  update();
})();
