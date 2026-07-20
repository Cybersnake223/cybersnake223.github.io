document.getElementById('year').textContent = new Date().getFullYear();

(function(){
  const btn = document.getElementById('toTop'), nav = document.querySelector('nav');
  let t = false;
  function onScroll(){
    if(t) return; t = true;
    requestAnimationFrame(()=>{
      const y = window.scrollY;
      btn.classList.toggle('visible', y > 400);
      nav.classList.toggle('scrolled', y > 20);
      t = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  btn.addEventListener('click', ()=> window.scrollTo({ top:0, behavior:'smooth' }));
})();

(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('js-animate');
  const io = new IntersectionObserver(entries=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold:0.07, rootMargin:'0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

/* ===== LIVE GITHUB API COUNTERS ===== */
(function(){
  const CACHE_KEY = 'gh_data', CACHE_TTL = 3600000;
  const counters = document.querySelectorAll('.gh-counter');
  const repoEl = [...counters].find(c => c.querySelector('.gh-counter-lbl')?.textContent.trim() === 'Repos')?.querySelector('.gh-counter-val');
  const yearEl = [...counters].find(c => c.querySelector('.gh-counter-lbl')?.textContent.trim() === 'Years')?.querySelector('.gh-counter-val');
  if(!repoEl) return;

  function animateCount(el, target){
    const dur = 1200, start = performance.now();
    function step(now){
      const p = Math.min((now-start)/dur, 1);
      const ease = 1 - Math.pow(1-p, 3);
      el.textContent = Math.floor(ease * target) + (p < 1 ? '' : '+');
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  async function loadGitHubData(){
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if(cached){
        const {data, ts} = JSON.parse(cached);
        if(Date.now() - ts < CACHE_TTL) return data;
      }
    } catch(e){}
    const res = await fetch('https://api.github.com/users/Cybersnake223');
    if(!res.ok) throw new Error('GitHub API error');
    const data = await res.json();
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({data, ts: Date.now()})); } catch(e){}
    return data;
  }

  const io = new IntersectionObserver(entries=>{
    entries.forEach(async e=>{
      if(!e.isIntersecting) return;
      io.unobserve(e.target);
      try {
        const data = await loadGitHubData();
        const repos = data.public_repos || 6;
        const joined = new Date(data.created_at);
        const years = Math.max(1, Math.floor((Date.now() - joined) / (1000*60*60*24*365.25)));
        animateCount(repoEl, repos);
        if(yearEl) animateCount(yearEl, years);
        const bioEl = document.querySelector('.gh-bio');
        if(bioEl && data.bio && data.bio.trim()) bioEl.textContent = data.bio;
      } catch(err){
        animateCount(repoEl, 6);
        if(yearEl) animateCount(yearEl, 2);
      }
    });
  }, { threshold: 0.5 });

  io.observe(repoEl);
})();

/* ===== LIVE PROJECT STAR COUNTS ===== */
(function(){
  const starEls = document.querySelectorAll('.proj-star');
  if(!starEls.length) return;
  const map = {};
  starEls.forEach(el => {
    const r = el.getAttribute('data-repo');
    if(r) map[r] = el.querySelector('.proj-star-count');
  });

  const CACHE_KEY = 'gh_stars', CACHE_TTL = 3600000;
  function animateCount(el, target){
    const dur = 900, start = performance.now();
    function step(now){
      const p = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(ease * target);
      if(p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  async function load(){
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if(cached){ const {data, ts} = JSON.parse(cached); if(Date.now() - ts < CACHE_TTL) return data; }
    } catch(e){}
    const res = await fetch('https://api.github.com/users/Cybersnake223/repos?per_page=100');
    if(!res.ok) throw new Error('GitHub API error');
    const data = await res.json();
    try { sessionStorage.setItem(CACHE_KEY, JSON.stringify({data, ts: Date.now()})); } catch(e){}
    return data;
  }

  load().then(repos => {
    if(!Array.isArray(repos)) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    repos.forEach(r => {
      const el = map[r.full_name];
      if(el && typeof r.stargazers_count === 'number'){
        if(reduce) el.textContent = r.stargazers_count;
        else animateCount(el, r.stargazers_count);
      }
    });
  }).catch(()=>{ /* keep default 0 on failure */ });
})();

(function(){
  const links = document.querySelectorAll('.nav-links a[href^="#"]:not(.nav-cta)');
  const sections = document.querySelectorAll('section[id]');
  const spy = new IntersectionObserver(entries=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        links.forEach(a => a.classList.remove('active'));
        const active = document.querySelector(`.nav-links a[href="#${e.target.id}"]`);
        if(active) active.classList.add('active');
      }
    });
  }, { rootMargin:'-40% 0px -55% 0px' });
  sections.forEach(s => spy.observe(s));
})();

/* ===== MOBILE NAV with keyboard trap + Escape ===== */
(function(){
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if(!toggle || !links) return;

  function openMenu(){
    links.classList.add('open');
    toggle.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    const first = links.querySelector('a');
    if(first) setTimeout(()=> first.focus(), 50);
  }
  function closeMenu(){
    links.classList.remove('open');
    toggle.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.focus();
  }

  toggle.addEventListener('click', ()=>{
    links.classList.contains('open') ? closeMenu() : openMenu();
  });

  links.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  document.addEventListener('keydown', e=>{
    if(!links.classList.contains('open')) return;
    if(e.key === 'Escape'){ closeMenu(); return; }
    if(e.key === 'Tab'){
      const focusable = [...links.querySelectorAll('a')];
      const first = focusable[0], last = focusable[focusable.length-1];
      if(e.shiftKey){
        if(document.activeElement === first){ e.preventDefault(); last.focus(); }
      } else {
        if(document.activeElement === last){ e.preventDefault(); toggle.focus(); }
      }
    }
  });

  document.addEventListener('click', e=>{
    if(links.classList.contains('open') && !links.contains(e.target) && e.target !== toggle){
      closeMenu();
    }
  });
})();

(function(){
  const btn = document.getElementById('copyEmail'), label = document.getElementById('copyEmailLabel');
  if(!btn) return;
  btn.addEventListener('click', async ()=>{
    try {
      await navigator.clipboard.writeText('nemesisjr111@gmail.com');
      label.textContent = 'Copied \u2713';
      btn.style.color = 'var(--teal)';
      setTimeout(()=>{ label.textContent = 'Copy Email'; btn.style.color = ''; }, 2000);
    } catch { label.textContent = 'nemesisjr111@gmail.com'; }
  });
})();

/* ===== GITHUB STATS — self-rendered on-brand fallback ===== */
async function ghApi(path){
  const res = await fetch('https://api.github.com' + path);
  if(!res.ok) throw new Error('GitHub API error');
  return res.json();
}

function ghCardLabel(img){
  const card = img.closest('.gh-stat-card');
  return card ? (card.querySelector('.gh-stat-lbl')?.textContent.trim() || '') : '';
}

function showFallback(img, html){
  const body = img.closest('.gh-stat-body');
  const fb = body ? body.querySelector('.gh-stat-fallback') : null;
  img.classList.add('error');
  if(body) body.classList.add('loaded');
  if(fb){ fb.innerHTML = html; fb.classList.add('rendered'); fb.style.display = 'flex'; }
}

const LANG_COLORS = { Shell:'#89e051', HTML:'#e34c26', CSS:'#563d7c', Rust:'#dea584', Lua:'#019733', JavaScript:'#f1e05a', Python:'#3572A5', TypeScript:'#3178c6', Dockerfile:'#384d54', C:'#555555', 'C++':'#f34b7d' };

function renderStatsFallback(data){
  const followers = data.followers ?? 0, following = data.following ?? 0, repos = data.public_repos ?? 0;
  const years = Math.max(1, Math.floor((Date.now() - new Date(data.created_at)) / (1000*60*60*24*365.25)));
  const cell = (v,l)=>`<div class="fb-stat"><span class="fb-stat-val">${v}</span><span class="fb-stat-lbl">${l}</span></div>`;
  return `<div class="fb-stats">${cell(repos,'Repos')}${cell(followers,'Followers')}${cell(following,'Following')}${cell(years,'Years')}</div>`;
}

function renderLangsFallback(repos){
  const totals = {};
  repos.forEach(r => { if(r.language) totals[r.language] = (totals[r.language]||0) + 1; });
  const entries = Object.entries(totals).sort((a,b)=>b[1]-a[1]).slice(0,6);
  const max = entries.length ? entries[0][1] : 1;
  return `<div class="fb-langs">${entries.map(([name,count])=>{
    const pct = Math.max(12, Math.round((count/max)*100));
    const c = LANG_COLORS[name] || '#3ecfcf';
    return `<div class="fb-lang"><span class="fb-lang-name">${name}</span><span class="fb-lang-bar"><span style="width:${pct}%;background:${c}"></span></span><span class="fb-lang-count">${count}</span></div>`;
  }).join('')}</div>`;
}

function computeStreak(contrib){
  const days = (contrib.contributions || []).filter(d=>d.date).sort((a,b)=>a.date.localeCompare(b.date));
  if(!days.length) return null;
  let longest = 0, cur = 0, prev = null;
  const next = (a,b)=>{ const d1 = new Date(a+'T00:00:00'); const d2 = new Date(b+'T00:00:00'); return (d2 - d1) === 86400000; };
  days.forEach(d=>{
    if(d.count > 0){ cur = (prev && next(prev, d.date)) ? cur+1 : 1; longest = Math.max(longest, cur); }
    else cur = 0;
    prev = d.date;
  });
  let curStreak = 0;
  for(let i = days.length-1; i >= 0; i--){ if(days[i].count > 0) curStreak++; else break; }
  return { longest, curStreak };
}

function renderHeatmap(contrib){
  const days = (contrib.contributions || []).filter(d=>d.date);
  if(!days.length) return '<div class="fb-empty">No contribution data</div>';
  const weeks = [];
  for(let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i+7));
  const lvlColor = ['#16202e','#0e3b3b','#146b6b','#1f9a9a','#3ecfcf'];
  const cell = 9, gap = 3, w = weeks.length*(cell+gap), h = 7*(cell+gap);
  let rects = '';
  weeks.forEach((wk,wi)=> wk.forEach((d,di)=>{
    const lvl = Math.max(0, Math.min(4, d.level||0));
    const x = wi*(cell+gap), y = di*(cell+gap);
    rects += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2" fill="${lvlColor[lvl]}"></rect>`;
  }));
  const total = contrib.total?.lastYear ?? days.reduce((s,d)=>s+(d.count||0),0);
  return `<div class="fb-heat"><svg viewBox="0 0 ${w} ${h}" width="100%" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Contribution heatmap">${rects}</svg><div class="fb-heat-total">${total} contributions in the last year</div></div>`;
}

window.handleStatsError = function(img){
  if(img.dataset.fallback) return;
  img.dataset.fallback = '1';
  const label = ghCardLabel(img);

  if(label === 'Top Languages'){
    try {
      const cached = JSON.parse(sessionStorage.getItem('gh_stars') || '{}');
      if(Array.isArray(cached.data)){ showFallback(img, renderLangsFallback(cached.data)); return; }
    } catch(e){}
    ghApi('/users/Cybersnake223/repos?per_page=100').then(repos=>showFallback(img, renderLangsFallback(repos))).catch(()=>showFallback(img,'<div class="fb-empty">Unavailable</div>'));
    return;
  }
  if(label === 'GitHub Stats'){
    ghApi('/users/Cybersnake223').then(data=>showFallback(img, renderStatsFallback(data))).catch(()=>showFallback(img,'<div class="fb-empty">Unavailable</div>'));
    return;
  }
  if(label === 'Activity Graph'){
    const yr = new Date().getFullYear();
    fetch(`https://github-contributions-api.jogruber.de/v4/Cybersnake223?y=${yr}`).then(r=>r.ok?r.json():Promise.reject()).then(d=>showFallback(img, renderHeatmap(d))).catch(()=>showFallback(img,'<div class="fb-empty">Activity unavailable</div>'));
    return;
  }
  if(label === 'Contribution Streak'){
    const yr = new Date().getFullYear();
    fetch(`https://github-contributions-api.jogruber.de/v4/Cybersnake223?y=${yr}`).then(r=>r.ok?r.json():Promise.reject()).then(d=>{
      const s = computeStreak(d);
      if(!s) return showFallback(img,'<div class="fb-empty">No data</div>');
      showFallback(img, `<div class="fb-stats"><div class="fb-stat"><span class="fb-stat-val">${s.curStreak}</span><span class="fb-stat-lbl">Current</span></div><div class="fb-stat"><span class="fb-stat-val">${s.longest}</span><span class="fb-stat-lbl">Longest</span></div></div>`);
    }).catch(()=>showFallback(img,'<div class="fb-empty">Unavailable</div>'));
    return;
  }
  showFallback(img, '<div class="fb-empty">Failed to load</div>');
};

document.querySelectorAll('.gh-stat-body img').forEach(img => {
  if(img.complete && img.naturalWidth > 0) { img.classList.add('loaded'); img.parentElement.classList.add('loaded'); }
  else if(img.complete && img.naturalWidth === 0) window.handleStatsError(img);
});

/* Cursor glow */
(function(){
  if(window.matchMedia('(pointer: coarse)').matches) return;
  const c = document.createElement('div');
  c.id = 'cursor-glow';
  Object.assign(c.style, {
    position:'fixed', pointerEvents:'none', zIndex:'9999',
    width:'320px', height:'320px',
    borderRadius:'50%',
    background:'radial-gradient(circle, rgba(62,207,207,0.06) 0%, transparent 70%)',
    transform:'translate(-50%,-50%)',
    top:'50%', left:'50%',
    transition:'opacity 0.3s',
    opacity:'0'
  });
  document.body.appendChild(c);
  let mx=window.innerWidth/2, my=window.innerHeight/2, cx=mx, cy=my, raf=null;
  document.addEventListener('mousemove', e=>{ mx=e.clientX; my=e.clientY; c.style.opacity='1'; }, {passive:true});
  document.addEventListener('mouseleave', ()=>{ c.style.opacity='0'; });
  function loop(){
    cx += (mx-cx)*0.12;
    cy += (my-cy)*0.12;
    c.style.left = cx+'px';
    c.style.top  = cy+'px';
    raf = requestAnimationFrame(loop);
  }
  loop();
})();

/* Subtle 3D tilt on project cards */
(function(){
  if(window.matchMedia('(pointer: coarse)').matches) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.project-card').forEach(card=>{
    card.addEventListener('mousemove', e=>{
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transform = `translateY(-3px) translateX(2px) rotateX(${-y*4}deg) rotateY(${x*4}deg)`;
      card.style.transformStyle = 'preserve-3d';
    });
    card.addEventListener('mouseleave', ()=>{
      card.style.transform = '';
      card.style.transformStyle = '';
    });
  });
})();

/* Typewriter for hero handle */
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const el = document.querySelector('.hero-handle');
  if(!el) return;
  const text = '@cybersnake223 \u00b7 New Delhi, India';
  const at = '<span class="at">@cybersnake223</span> &middot; New Delhi, India';
  el.innerHTML = '<span class="at"></span>';
  const atSpan = el.querySelector('.at');
  let i = 0;
  const atText = '@cybersnake223';
  const suffix = document.createTextNode(' \u00b7 New Delhi, India');
  function type(){
    if(i <= atText.length){
      atSpan.textContent = atText.slice(0,i);
      i++;
      setTimeout(type, 55 + Math.random()*30);
    } else {
      el.appendChild(suffix);
    }
  }
  setTimeout(type, 900);
})();

/* Magnetic pull on primary buttons */
(function(){
  if(window.matchMedia('(pointer: coarse)').matches) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn=>{
    btn.addEventListener('mousemove', e=>{
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width/2)  * 0.22;
      const y = (e.clientY - r.top  - r.height/2) * 0.22;
      btn.style.transform = `translate(${x}px, ${y}px) translateY(-2px)`;
    });
    btn.addEventListener('mouseleave', ()=>{ btn.style.transform = ''; });
  });
})();

/* ===== SCROLL PROGRESS BAR ===== */
(function(){
  const bar = document.getElementById('scroll-progress');
  if(!bar) return;
  function updateBar(){
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (scrolled/total)*100 : 0) + '%';
  }
  window.addEventListener('scroll', updateBar, {passive:true});
  updateBar();
})();

/* ===== TERMINAL TYPEWRITER ===== */
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const cmdEl = document.getElementById('termCmd');
  const curEl = document.getElementById('termCursor');
  const outEl = document.getElementById('termOutput');
  const termWrap = document.querySelector('.hero-terminal');
  if(!cmdEl || !outEl || !termWrap) return;

  const sequences = [
    { cmd:'neofetch --off', out:[
      '<span class="hi">OS</span>        CachyOS Linux x86_64',
      '<span class="hi">WM</span>        Hyprland (Wayland)',
      '<span class="hi">Shell</span>     Bash 5.2.37',
      '<span class="hi">Terminal</span>  Foot v1.19',
      '<span class="hi">Editor</span>    <span class="gold">Neovim v0.11</span>',
      '<span class="green">\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500</span>'
    ]},
    { cmd:'docker ps --format "table {{.Names}}\t{{.Status}}"', out:[
      '<span class="hi">NAMES</span>            STATUS',
      '<span class="green">metabase</span>         Up 3 days',
      '<span class="green">superset</span>         Up 3 days',
      '<span class="green">mariadb</span>          Up 3 days',
      '<span class="green">nginx-proxy</span>      Up 3 days'
    ]},
    { cmd:'uptime -p', out:[
      '<span class="gold">up 6 days, 4 hours, 17 minutes</span>'
    ]},
    { cmd:'ls ~/projects', out:[
      '<span class="hi">vicious-viper/</span>   <span class="gold">mkgit-gh/</span>   <span class="green">analytics-stack/</span>   zen-config/'
    ]},
  ];

  let seq = 0;
  let paused = false;
  let seqTimer = null;

  termWrap.addEventListener('mouseenter', ()=>{ paused = true; });
  termWrap.addEventListener('mouseleave', ()=>{
    paused = false;
    runSequence();
  });

  function runSequence(){
    if(paused) return;
    if(seqTimer) { clearTimeout(seqTimer); seqTimer = null; }
    const s = sequences[seq % sequences.length];
    seq++;
    let i = 0;
    cmdEl.textContent = '';
    outEl.innerHTML = '';
    curEl.style.display = 'inline-block';
    function typeChar(){
      if(paused) return;
      if(i <= s.cmd.length){
        cmdEl.textContent = s.cmd.slice(0,i);
        i++;
        seqTimer = setTimeout(typeChar, 45 + Math.random()*25);
      } else {
        curEl.style.display = 'none';
        let oi = 0;
        function showLine(){
          if(paused) return;
          if(oi < s.out.length){
            const d = document.createElement('div');
            d.className = 'term-out';
            d.innerHTML = s.out[oi];
            outEl.appendChild(d);
            oi++;
            seqTimer = setTimeout(showLine, 80);
          } else {
            seqTimer = setTimeout(()=>{
              outEl.style.transition = 'opacity 0.4s';
              outEl.style.opacity = '0';
              cmdEl.style.opacity = '0';
              seqTimer = setTimeout(()=>{
                outEl.innerHTML = '';
                outEl.style.opacity = '1';
                cmdEl.style.opacity = '1';
                runSequence();
              }, 500);
            }, 2800);
          }
        }
        seqTimer = setTimeout(showLine, 180);
      }
    }
    typeChar();
  }
  setTimeout(runSequence, 1200);
})();

/* ===== THEME TOGGLE (with prefers-color-scheme + View Transitions) ===== */
(function(){
  const btn = document.getElementById('themeToggle');
  const icon = document.getElementById('themeIcon');
  if(!btn) return;
  const moonSvg = '<circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>';
  const sunSvg  = '<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';

  const saved = localStorage.getItem('theme');
  const osPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
  let light = saved ? saved === 'light' : osPrefersLight;

  function applyTheme(){
    document.documentElement.classList.toggle('light', light);
    icon.innerHTML = light ? sunSvg : moonSvg;
    btn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    localStorage.setItem('theme', light ? 'light' : 'dark');
  }

  function toggleWithTransition(){
    light = !light;
    if(document.startViewTransition){
      document.startViewTransition(() => applyTheme());
    } else {
      applyTheme();
    }
  }

  applyTheme();
  btn.addEventListener('click', toggleWithTransition);

  window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
    if(!localStorage.getItem('theme')){
      light = e.matches;
      applyTheme();
    }
  });
})();

/* ===== CONTACT FORM INLINE VALIDATION ===== */
(function(){
  const fields = [
    { el: document.getElementById('fname'), msg: document.getElementById('fnameMsg') },
    { el: document.getElementById('femail'), msg: document.getElementById('femailMsg') },
    { el: document.getElementById('fmsg'), msg: document.getElementById('fmsgMsg') },
  ].filter(f => f.el && f.msg);
  fields.forEach(({el, msg}) => {
    el.addEventListener('input', () => {
      const valid = el.checkValidity();
      el.classList.toggle('valid', valid);
      el.classList.toggle('invalid', !valid && el.value.length > 0);
      if(!el.value.length) {
        msg.textContent = '';
        msg.className = 'form-msg';
        el.className = el.className.replace(/\b(valid|invalid)\b/g, '').trim();
      } else if(valid) {
        msg.textContent = '\u2713';
        msg.className = 'form-msg valid';
      } else {
        msg.textContent = el.validationMessage || 'Invalid';
        msg.className = 'form-msg invalid';
      }
    });
    el.addEventListener('blur', () => {
      if(!el.value.length) {
        msg.textContent = '';
        msg.className = 'form-msg';
        el.className = el.className.replace(/\b(valid|invalid)\b/g, '').trim();
      }
    });
  });
})();

/* ===== CONTACT FORM SUBMIT ===== */
(function(){
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if(!form || !status) return;
  form.addEventListener('submit', async e=>{
    e.preventDefault();
    const btn = form.querySelector('.form-submit');
    btn.disabled = true;
    btn.style.opacity = '0.7';
    status.textContent = 'Sending\u2026';
    try {
      const res = await fetch(form.action, {
        method:'POST',
        body: new FormData(form),
        headers:{ 'Accept':'application/json' }
      });
      if(res.ok){
        status.textContent = '\u2713 Message sent! I\'ll reply soon.';
        status.style.color = '#4ade80';
        form.reset();
      } else {
        throw new Error('fail');
      }
    } catch {
      status.textContent = '\u2717 Something went wrong. Email me directly.';
      status.style.color = '#f87171';
    } finally {
      btn.disabled = false;
      btn.style.opacity = '1';
      setTimeout(()=>{ status.textContent=''; status.style.color=''; }, 5000);
    }
  });
})();

/* ===== NAV LINK TEXT SCRAMBLE ===== */
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if(window.matchMedia('(pointer: coarse)').matches) return;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz@#$%&*';
  document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(link => {
    const orig = link.textContent.trim();
    let timer = null;
    link.addEventListener('mouseenter', () => {
      let iter = 0;
      clearInterval(timer);
      timer = setInterval(() => {
        link.textContent = orig.split('').map((c, i) => {
          if(c === ' ') return ' ';
          if(i < iter) return orig[i];
          return chars[Math.floor(Math.random() * chars.length)];
        }).join('');
        iter += 0.6;
        if(iter >= orig.length){
          link.textContent = orig;
          clearInterval(timer);
        }
      }, 28);
    });
    link.addEventListener('mouseleave', () => {
      clearInterval(timer);
      link.textContent = orig;
    });
  });
})();

/* ===== SKILL PROFICIENCY DOTS ===== */
(function(){
  document.querySelectorAll('.ctag[data-proficiency]').forEach(tag => {
    const val = parseInt(tag.dataset.proficiency, 10);
    if(val < 1 || val > 5) return;
    const wrap = document.createElement('span');
    wrap.className = 'prof-dots';
    wrap.setAttribute('aria-hidden', 'true');
    for(let i = 0; i < 5; i++) {
      const dot = document.createElement('span');
      dot.className = 'prof-dot' + (i < val ? ' on' : ' off');
      wrap.appendChild(dot);
    }
    tag.appendChild(wrap);
    tag.setAttribute('aria-label', tag.textContent.trim().replace(/\s+/g, ' ') + ' — proficiency ' + val + ' out of 5');
  });
})();

/* ===== 30. SKILL TAG STAGGER ENTRANCE ===== */
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const clusters = document.querySelectorAll('.cluster-tags');
  clusters.forEach(cluster => {
    const tags = cluster.querySelectorAll('.ctag');
    tags.forEach(t => t.classList.add('stagger-hidden'));
  });
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;
      io.unobserve(entry.target);
      const tags = entry.target.querySelectorAll('.ctag');
      tags.forEach((tag, i) => {
        setTimeout(() => {
          tag.classList.remove('stagger-hidden');
          tag.classList.add('stagger-in');
        }, i * 60);
      });
    });
  }, { threshold: 0.2 });
  clusters.forEach(c => io.observe(c));
})();

/* ===== 31. IST LIVE CLOCK ===== */
(function(){
  const el = document.getElementById('ist-clock');
  if(!el) return;
  function tick(){
    const now = new Date();
    const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
    const h = String(ist.getHours()).padStart(2,'0');
    const m = String(ist.getMinutes()).padStart(2,'0');
    const s = String(ist.getSeconds()).padStart(2,'0');
    el.textContent = h + ':' + m + ':' + s + ' IST';
  }
  tick();
  setInterval(tick, 1000);
})();

/* ===== SERVICE WORKER REGISTRATION ===== */
if('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
