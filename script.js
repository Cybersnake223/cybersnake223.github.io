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
        if(bioEl && data.bio) bioEl.textContent = data.bio;
      } catch(err){
        animateCount(repoEl, 6);
        if(yearEl) animateCount(yearEl, 2);
      }
    });
  }, { threshold: 0.5 });

  io.observe(repoEl);
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

/* GitHub stats card error handling */
window.handleStatsError = function(img) {
  img.classList.add('error');
  if(!img.dataset.retried) {
    img.dataset.retried = '1';
    setTimeout(() => {
      const src = img.src;
      img.src = '';
      img.src = src;
    }, 3000);
  }
};
document.querySelectorAll('.gh-stat-body img').forEach(img => {
  if(img.complete && img.naturalWidth > 0) img.classList.add('loaded');
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
  if(!cmdEl || !outEl) return;

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
  function runSequence(){
    const s = sequences[seq % sequences.length];
    seq++;
    let i = 0;
    cmdEl.textContent = '';
    outEl.innerHTML = '';
    curEl.style.display = 'inline-block';
    function typeChar(){
      if(i <= s.cmd.length){
        cmdEl.textContent = s.cmd.slice(0,i);
        i++;
        setTimeout(typeChar, 45 + Math.random()*25);
      } else {
        curEl.style.display = 'none';
        let oi = 0;
        function showLine(){
          if(oi < s.out.length){
            const d = document.createElement('div');
            d.className = 'term-out';
            d.innerHTML = s.out[oi];
            outEl.appendChild(d);
            oi++;
            setTimeout(showLine, 80);
          } else {
            setTimeout(()=>{
              outEl.style.transition = 'opacity 0.4s';
              outEl.style.opacity = '0';
              cmdEl.style.opacity = '0';
              setTimeout(()=>{
                outEl.innerHTML = '';
                outEl.style.opacity = '1';
                cmdEl.style.opacity = '1';
                runSequence();
              }, 500);
            }, 2800);
          }
        }
        setTimeout(showLine, 180);
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

/* ===== CONTACT FORM ===== */
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

/* ===== SNAKE GAME ===== */
(function(){
  const canvas = document.getElementById('snakeCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const scoreEl = document.getElementById('snakeScore');
  const highEl = document.getElementById('snakeHigh');
  const speedEl = document.getElementById('snakeSpeed');
  const overlay = document.getElementById('snakeOverlay');
  const finalScoreEl = document.getElementById('snakeFinalScore');
  if(!canvas || !ctx) return;

  const GRID = 20, CELL = 20, TICK_BASE = 150;
  const HIGH_KEY = 'snake_high';
  let high = parseInt(localStorage.getItem(HIGH_KEY)) || 0;
  if(highEl) highEl.textContent = high;

  let snake, food, dir, nextDir, score, speed, tick, gameOver, loop;

  function randCell(){
    return {
      x: Math.floor(Math.random() * GRID),
      y: Math.floor(Math.random() * GRID)
    };
  }

  function spawnFood(){
    let c;
    do { c = randCell(); } while(snake.some(s => s.x === c.x && s.y === c.y));
    food = c;
  }

  function init(){
    snake = [{x:10,y:10},{x:9,y:10},{x:8,y:10}];
    dir = {x:1,y:0};
    nextDir = {x:1,y:0};
    score = 0;
    speed = 1;
    tick = TICK_BASE;
    gameOver = false;
    if(scoreEl) scoreEl.textContent = '0';
    if(speedEl) speedEl.textContent = '1';
    if(overlay) overlay.classList.remove('active');
    spawnFood();
    draw();
  }

  function draw(){
    ctx.clearRect(0, 0, 400, 400);

    // grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.03)';
    ctx.lineWidth = 0.5;
    for(let i = 0; i <= GRID; i++){
      ctx.beginPath(); ctx.moveTo(i*CELL,0); ctx.lineTo(i*CELL,400); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0,i*CELL); ctx.lineTo(400,i*CELL); ctx.stroke();
    }

    // food
    ctx.shadowColor = 'rgba(201,168,76,0.5)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#c9a84c';
    ctx.beginPath();
    ctx.arc(food.x*CELL + CELL/2, food.y*CELL + CELL/2, CELL/2 - 2, 0, Math.PI*2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // snake
    snake.forEach((seg, i) => {
      const t = i / snake.length;
      const r = Math.round(62 + (62-62)*t);
      const g = Math.round(207 - (207-160)*t);
      const b = Math.round(207 - (207-80)*t);
      ctx.fillStyle = i === 0 ? '#3ecfcf' : `rgb(${r},${g},${b})`;
      ctx.shadowColor = i === 0 ? 'rgba(62,207,207,0.4)' : 'transparent';
      ctx.shadowBlur = i === 0 ? 6 : 0;
      const pad = i === 0 ? 1 : 2;
      ctx.beginPath();
      ctx.roundRect(seg.x*CELL + pad, seg.y*CELL + pad, CELL - pad*2, CELL - pad*2, 3);
      ctx.fill();

      // eyes on head
      if(i === 0){
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#080c14';
        const ex = dir.x === 1 ? 3 : dir.x === -1 ? CELL - 6 : CELL/2 - 2;
        const ey = dir.y === 1 ? 3 : dir.y === -1 ? CELL - 6 : CELL/2 - 2;
        ctx.beginPath(); ctx.arc(seg.x*CELL + ex, seg.y*CELL + ey, 2, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(seg.x*CELL + CELL - ex, seg.y*CELL + ey, 2, 0, Math.PI*2); ctx.fill();
      }
    });
  }

  function update(){
    if(gameOver) return;

    dir = {...nextDir};
    const head = {x: snake[0].x + dir.x, y: snake[0].y + dir.y};

    // wall collision
    if(head.x < 0 || head.x >= GRID || head.y < 0 || head.y >= GRID){
      endGame();
      return;
    }

    // self collision
    if(snake.some(s => s.x === head.x && s.y === head.y)){
      endGame();
      return;
    }

    snake.unshift(head);

    if(head.x === food.x && head.y === food.y){
      score++;
      if(scoreEl) scoreEl.textContent = score;
      if(score % 5 === 0 && speed < 10){
        speed++;
        tick = Math.max(50, TICK_BASE - (speed-1)*12);
        if(speedEl) speedEl.textContent = speed;
        clearInterval(loop);
        loop = setInterval(step, tick);
      }
      spawnFood();
    } else {
      snake.pop();
    }

    draw();
  }

  function step(){ update(); }

  function endGame(){
    gameOver = true;
    clearInterval(loop);
    if(finalScoreEl) finalScoreEl.textContent = score;
    if(overlay) overlay.classList.add('active');
    if(score > high){
      high = score;
      localStorage.setItem(HIGH_KEY, high);
      if(highEl) highEl.textContent = high;
    }
  }

  function restart(){
    clearInterval(loop);
    init();
    loop = setInterval(step, tick);
  }

  // start
  init();
  loop = setInterval(step, tick);

  // keyboard
  document.addEventListener('keydown', e => {
    const key = e.key;
    if(key === 'Enter' || key === ' '){
      e.preventDefault();
      if(gameOver) restart();
      return;
    }

    if(gameOver) return;

    switch(key){
      case 'ArrowUp':    case 'w': case 'W': if(dir.y !== 1) { nextDir = {x:0,y:-1}; } break;
      case 'ArrowDown':  case 's': case 'S': if(dir.y !== -1){ nextDir = {x:0,y:1};  } break;
      case 'ArrowLeft':  case 'a': case 'A': if(dir.x !== 1) { nextDir = {x:-1,y:0}; } break;
      case 'ArrowRight': case 'd': case 'D': if(dir.x !== -1){ nextDir = {x:1,y:0};  } break;
    }
  });

  // touch/swipe support
  let touchX = 0, touchY = 0;
  canvas.addEventListener('touchstart', e => {
    const t = e.touches[0];
    touchX = t.clientX;
    touchY = t.clientY;
  }, {passive: true});

  canvas.addEventListener('touchend', e => {
    if(gameOver){
      restart();
      return;
    }
    const t = e.changedTouches[0];
    const dx = t.clientX - touchX;
    const dy = t.clientY - touchY;
    if(Math.abs(dx) > Math.abs(dy)){
      if(dx > 10 && dir.x !== -1) { nextDir = {x:1,y:0}; }
      else if(dx < -10 && dir.x !== 1) { nextDir = {x:-1,y:0}; }
    } else {
      if(dy > 10 && dir.y !== -1) { nextDir = {x:0,y:1}; }
      else if(dy < -10 && dir.y !== 1) { nextDir = {x:0,y:-1}; }
    }
  }, {passive: true});
})();

/* ===== SERVICE WORKER REGISTRATION ===== */
if('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  });
}
