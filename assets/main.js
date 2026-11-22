/* Shared behaviour for every page of the portfolio */
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Theme (stored per visitor) ----
  var root = document.documentElement, t = document.getElementById('theme');
  try { var saved = localStorage.getItem('theme'); if (saved) root.dataset.theme = saved; } catch(e){}
  if (t) t.addEventListener('click', function(){
    var dark = root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = dark ? 'light' : 'dark';
    try { localStorage.setItem('theme', root.dataset.theme); } catch(e){}
  });

  // ---- Play videos only while visible ----
  var vio = 'IntersectionObserver' in window ? new IntersectionObserver(function(es){
    es.forEach(function(en){ var v = en.target; if (en.isIntersecting && !reduce) v.play().catch(function(){}); else v.pause(); });
  }, {threshold:.25}) : null;

  // ---- Media loader ----
  document.querySelectorAll('.media[data-src]').forEach(function(el){
    var src = el.dataset.src, isVid = /\.(mp4|webm|mov)$/i.test(src);
    var m = document.createElement(isVid ? 'video' : 'img');
    if (isVid) {
      m.muted = true; m.loop = true; m.playsInline = true; m.preload = 'metadata';
      m.setAttribute('muted',''); m.setAttribute('playsinline','');
      m.poster = src.replace(/\.\w+$/, '.jpg');
    } else { m.alt = el.dataset.alt || ''; m.decoding = 'async'; }
    m.addEventListener(isVid ? 'loadedmetadata' : 'load', function(){
      el.prepend(m); el.classList.add('loaded');
      if (el.dataset.badge) { var b = document.createElement('span'); b.className = 'badge'; b.innerHTML = '<i></i>' + el.dataset.badge; el.append(b); }
      if (isVid) { if (vio) vio.observe(m); else if (!reduce) m.play().catch(function(){}); }
    });
    m.src = src;
  });

  // ---- Experiment explorer tabs (cable project page) ----
  var tabs = document.querySelectorAll('#explorer [role=tab]');
  if (tabs.length) {
    var select = function(i){
      tabs.forEach(function(tb, j){
        var on = i === j, p = document.getElementById(tb.getAttribute('aria-controls'));
        tb.setAttribute('aria-selected', on); tb.tabIndex = on ? 0 : -1; p.hidden = !on;
        p.querySelectorAll('video').forEach(function(v){ if (on) { v.currentTime = 0; if (!reduce) v.play().catch(function(){}); } else v.pause(); });
      });
    };
    tabs.forEach(function(tb, i){
      tb.addEventListener('click', function(){ select(i); });
      tb.addEventListener('keydown', function(e){
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); var n = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; select(n); tabs[n].focus(); }
      });
    });
    select(0);
  }

  // ---- Lightbox ----
  document.addEventListener('click', function(e){
    var el = e.target.closest('.media.loaded'); if (!el) return;
    var src = el.querySelector('img,video'); if (!src) return;
    var lb = document.createElement('div'); lb.className = 'lb'; lb.setAttribute('role','dialog'); lb.setAttribute('aria-modal','true');
    var c = document.createElement(src.tagName);
    c.src = src.currentSrc || src.src;
    if (c.tagName === 'VIDEO') { c.controls = true; c.loop = true; c.playsInline = true; c.autoplay = true; c.currentTime = src.currentTime; } else c.alt = src.alt;
    var x = document.createElement('button'); x.type = 'button'; x.setAttribute('aria-label','Close'); x.textContent = '×';
    lb.append(c, x); document.body.append(lb); x.focus();
    if (src.tagName === 'VIDEO') src.pause();
    function close(){ lb.remove(); document.removeEventListener('keydown', esc); if (src.tagName === 'VIDEO' && !reduce) src.play().catch(function(){}); }
    function esc(ev){ if (ev.key === 'Escape') close(); }
    lb.addEventListener('click', function(ev){ if (ev.target === lb || ev.target === x) close(); });
    document.addEventListener('keydown', esc);
  });

  // ---- Copy to clipboard ----
  document.querySelectorAll('[data-copy]').forEach(function(b){
    var v = b.querySelector('.v'), label = v.textContent;
    b.addEventListener('click', function(){
      try { navigator.clipboard.writeText(b.dataset.copy).then(function(){ v.textContent = 'Copied ✓'; setTimeout(function(){ v.textContent = label; }, 1400); }, function(){}); } catch(e){}
    });
  });

  // ---- Nav state + scroll reveal ----
  var nav = document.getElementById('nav');
  addEventListener('scroll', function(){ nav.classList.toggle('scrolled', scrollY > 8); }, {passive:true});
  var links = document.querySelectorAll('.nav ul a[href^="#"]');
  if ('IntersectionObserver' in window) {
    if (links.length) {
      var so = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting) links.forEach(function(a){ a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id); }); }); }, {rootMargin:'-45% 0px -50% 0px'});
      links.forEach(function(a){ var s = document.getElementById(a.getAttribute('href').slice(1)); if (s) so.observe(s); });
    }
    var ro = new IntersectionObserver(function(es){ es.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('in'); ro.unobserve(en.target); } }); }, {rootMargin:'0px 0px -8% 0px'});
    document.querySelectorAll('.rv').forEach(function(el){ ro.observe(el); });
  } else {
    document.querySelectorAll('.rv').forEach(function(el){ el.classList.add('in'); });
  }
})();
