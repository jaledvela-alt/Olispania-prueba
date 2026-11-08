/* Olispania · comportamiento dinámico de la web
   Todo es opcional: sin JavaScript o con «reducir movimiento» la web se ve completa y estática. */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 1. Aparición al hacer scroll ---------- */
  var TW_SEL = 'main h1, .moment__big, .contact__lema, .welcome h2, .dark__text h2';
  var REVEAL = [
    '.hero__text > *', '.hero__jars', '.sec__head', '.welcome__text > *', '.welcome__img',
    '.ifs__in > *', '.eco__head > *', '.eco__stats li', '.eco__money > *', '.perte__img',
    '.chero__text > *', '.chero__img', '.chero__jars figure', '.tbl', '.pcard', '.tile',
    '.pillars li', '.facts li', '.addr > *', '.form > *', '.stats li', '.nw', '.contact__in > *', '.health__in > *', '.seal__in > *',
    '.story__in > *', '.moment__big', '.moment .claim', '.foot__in > *', '.others'
  ];
  var targets = [];
  $(REVEAL.join(',')).forEach(function (el) {
    if (el.classList.contains('rv')) return;
    if (!reduce && el.matches(TW_SEL)) return; /* los títulos grandes se escriben letra a letra (punto 7) */
    var sibs = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    var step = el.classList.contains('pcard') || el.classList.contains('tile') ? 4 : 6;
    el.style.setProperty('--d', ((sibs % step) * 0.07).toFixed(2) + 's');
    el.classList.add('rv');
    targets.push(el);
  });

  /* ---------- 2. Contadores ---------- */
  var LANG = document.documentElement.lang, EN = LANG === 'en', FR = LANG === 'fr';
  var NUM = /\d[\d.,\u00a0\u202f]*/;
  function parseEs(txt) {
    var m = txt.match(NUM); if (!m) return null;
    var raw = m[0], dec = 0;
    var D = EN ? '.' : ',';
    if (raw.indexOf(D) > -1) dec = raw.split(D)[1].length;
    var val = parseFloat(raw.replace(FR ? /[\u00a0\u202f]/g : (EN ? /,/g : /\./g), '').replace(D, '.'));
    if (isNaN(val)) return null;
    return { raw: raw, val: val, dec: dec };
  }
  function fmt(v, dec) {
    return new Intl.NumberFormat(EN ? 'en-GB' : (FR ? 'fr-FR' : 'es-ES'), { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: 'always' }).format(v);
  }
  function countUp(el) {
    var node = null;
    for (var i = 0; i < el.childNodes.length; i++) {
      if (el.childNodes[i].nodeType === 3 && NUM.test(el.childNodes[i].nodeValue)) { node = el.childNodes[i]; break; }
    }
    if (!node) return;
    var info = parseEs(node.nodeValue); if (!info) return;
    var full = node.nodeValue, t0 = null, dur = 1300;
    function frame(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      node.nodeValue = full.replace(info.raw, fmt(info.val * e, info.dec));
      if (p < 1) requestAnimationFrame(frame); else node.nodeValue = full;
    }
    node.nodeValue = full.replace(info.raw, fmt(0, info.dec));
    requestAnimationFrame(frame);
  }
  var counters = $('.eco__stats strong, .eco__row strong, .seal__num, .stats strong');

  /* ---------- Observador común ---------- */
  var bars = $('.eco');
  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('in'); });
    bars.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in'); io.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    targets.forEach(function (el) { io.observe(el); });
    bars.forEach(function (el) { io.observe(el); });
    var io2 = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        countUp(en.target); io2.unobserve(en.target);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { io2.observe(el); });
  }

  /* ---------- 3. Cabecera, barra de progreso y botón «subir» ---------- */
  var top = document.querySelector('.top');
  var bar = document.createElement('div'); bar.className = 'progress'; bar.setAttribute('aria-hidden', 'true');
  document.body.appendChild(bar);
  var up = document.createElement('button');
  up.className = 'totop'; up.type = 'button'; up.setAttribute('aria-label', EN ? 'Back to top' : (FR ? 'Retour en haut' : 'Volver arriba')); up.innerHTML = '<span aria-hidden="true"></span>';
  up.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  document.body.appendChild(up);
  /* Pastilla negra: cae como una gota al entrar y se encoge al hacer scroll (el logo en negativo va dentro) */
  (function () {
    var a = top && top.querySelector('.top__logo'), im = a && a.querySelector('img');
    if (!a || !im) return;
    var pill = document.createElement('span'); pill.className = 'logo-pill'; pill.setAttribute('aria-hidden', 'true');
    var pi = document.createElement('img'); pi.src = im.getAttribute('src').replace('Olispania_vertical_positivo.svg', 'Olispania_vertical_negativo.svg'); pi.alt = ''; pi.width = 52; pi.height = 85;
    pill.appendChild(pi); a.appendChild(pill);
    var ball = document.createElement('span'); ball.className = 'logo-ball'; ball.setAttribute('aria-hidden', 'true'); a.appendChild(ball);
    var on = function () { top.classList.remove('logo-drop'); top.classList.add('pill-on'); };
    var isHome = /(^|\/)(index\.html)?$/.test(location.pathname);
    if (!isHome || reduce || (window.scrollY || 0) > 24) { on(); return; }
    /* Móvil / tablet: sin animación de gota; el logo aparece con un fundido */
    if (matchMedia('(max-width:980px)').matches) { top.classList.add('pill-fade'); requestAnimationFrame(function () { requestAnimationFrame(on); }); return; }
    pi.addEventListener('animationend', function () { on(); });
    /* Vídeo de la gota (WebM con transparencia, 5 s). Safari no pinta el alfa de VP9: ahí se usa la animación calculada de abajo */
    var apple = /Apple/.test(navigator.vendor || '');
    var probe = document.createElement('video');
    var canVideo = !apple && probe.canPlayType && /maybe|probably/.test(probe.canPlayType('video/webm; codecs="vp9"'));
    var runCalc;
    if (canVideo) {
      var vid = document.createElement('video');
      vid.className = 'logo-video'; vid.muted = true; vid.defaultMuted = true; vid.playsInline = true; vid.preload = 'auto';
      vid.setAttribute('aria-hidden', 'true'); vid.setAttribute('muted', ''); vid.setAttribute('playsinline', '');
      vid.src = 'img/2026-11-07_Web_gota-logo_v2.webm'.replace(/^/, /^\/(en|fr)\//.test(location.pathname) ? '../' : '');
      var done = false;
      var finish = function () { if (done) return; done = true; top.classList.add('pill-on'); requestAnimationFrame(function () { if (vid.parentNode) vid.parentNode.removeChild(vid); }); };
      var fail = function () { if (done) return; done = true; if (vid.parentNode) vid.parentNode.removeChild(vid); runCalc(); };
      vid.addEventListener('timeupdate', function () { if (vid.currentTime >= 3.6) finish(); });
      vid.addEventListener('ended', finish);
      vid.addEventListener('error', fail);
      a.appendChild(vid);
      var pr = vid.play(); if (pr && pr.catch) pr.catch(fail);
      setTimeout(finish, 6500);
      return;
    }
    runCalc = function () {
    top.classList.add('logo-drop');
      /* la gota se calcula fotograma a fotograma (WAAPI): cuelga de un cuello fino, cae, se ensancha y el cuello se abre al final */
      var sm = function (t) { t = Math.max(0, Math.min(1, t)); return t * t * (3 - 2 * t); };
      var eo = function (t) { t = Math.max(0, Math.min(1, t)); return 1 - Math.pow(1 - t, 3); };
      var eio = function (t) { t = Math.max(0, Math.min(1, t)); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
      var f1 = function (v) { return (Math.round(v * 10) / 10) + '%'; };
      var shape = function (t) {
        var u = Math.min(t / .5, 1);
        var F = .025 + .975 * Math.pow(u, 2.1);                      /* frente de la gota: cae acelerando */
        var wb = .16 + .84 * eo(Math.min(t / .52, 1));                /* ancho del bulbo */
        var o = eio((t - .5) / .42);                                  /* apertura del cuello al final */
        var wn = (.05 - .02 * Math.min(u, 1)) * (1 - o) + o;          /* ancho del cuello */
        var hb = Math.min(.12 + .5 * wb, F);                          /* alto del bulbo */
        var ry = Math.min(.28, hb * .6);                              /* redondeo inferior */
        var ys = [], i, n = 18, m = 14;
        for (i = 0; i < n; i++) ys.push((F - ry) * i / n);
        for (i = 0; i <= m; i++) ys.push(F - ry + ry * Math.sin(Math.PI / 2 * i / m));
        var L = [], R = [];
        ys.forEach(function (y) {
          var w = wn + (wb - wn) * sm((y - (F - hb)) / (hb * .75));
          if (y > F - ry) { var q = (y - (F - ry)) / ry; w *= Math.sqrt(Math.max(0, 1 - q * q)); }
          L.push(50 - w * 50); R.push(50 + w * 50);
        });
        var pts = [], k;
        for (k = 0; k < ys.length; k++) pts.push(f1(L[k]) + ' ' + f1(ys[k] * 100));
        for (k = ys.length - 1; k >= 0; k--) pts.push(f1(R[k]) + ' ' + f1(ys[k] * 100));
        return 'polygon(' + pts.join(',') + ')';
      };
      var kf = [], N = 120, j;
      for (j = 0; j <= N; j++) kf.push({ clipPath: shape(j / N) });
      if (pill.animate) pill.animate(kf, { duration: 2400, easing: 'linear', fill: 'forwards' });
    };
    setTimeout(runCalc, 250);
    setTimeout(on, 4600); /* seguro por si la animación no llega a terminar */
  })();
  var ticking = false;
  function onScroll() {
    var y = window.scrollY || 0, h = document.documentElement.scrollHeight - window.innerHeight;
    if (top) top.classList.toggle('is-scrolled', y > 24);
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
    up.classList.toggle('show', y > 700);
    ticking = false;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- 4. Buscador de productos (páginas con muchas fichas) ---------- */
  var grid = $('.pgrid').filter(function (g) { return g.children.length >= 8; })[0];
  if (grid) {
    var group = grid.closest('.group') || grid.parentElement;
    var box = document.createElement('div'); box.className = 'finder';
    box.innerHTML = (EN ? '<label for="buscar">Search products</label><input id="buscar" type="search" placeholder="Gherkins, banderillas, garlic…" autocomplete="off">' : FR ? '<label for="buscar">Rechercher un produit</label><input id="buscar" type="search" placeholder="Cornichons, banderillas, ails…" autocomplete="off">' : '<label for="buscar">Buscar producto</label><input id="buscar" type="search" placeholder="Pepinillos, banderillas, ajos…" autocomplete="off">') + '<p class="finder__n" aria-live="polite"></p>';
    group.parentElement.insertBefore(box, $('.group', group.parentElement)[0]);
    var cards = $('.pcard');
    var inp = box.querySelector('input'), msg = box.querySelector('.finder__n');
    var norm = function (s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
    inp.addEventListener('input', function () {
      var q = norm(inp.value.trim()), n = 0;
      cards.forEach(function (c) {
        var ok = !q || norm(c.textContent).indexOf(q) > -1;
        c.hidden = !ok; if (ok) { c.classList.add('in'); n++; }
      });
      $('.group').forEach(function (g) {
        var any = $('.pcard', g).some(function (c) { return !c.hidden; });
        if ($('.pcard', g).length) g.hidden = !any;
      });
      msg.textContent = q ? (n ? n + (EN ? (n === 1 ? ' product' : ' products') : FR ? (n === 1 ? ' produit' : ' produits') : (n === 1 ? ' producto' : ' productos')) : (EN ? 'No products with that name.' : FR ? 'Aucun produit portant ce nom.' : 'No hay productos con ese nombre.')) : '';
    });
  }

  /* ---------- 5. Ratón sobre el titular: los tarros se mueven un poco ---------- */
  var jars = document.querySelector('.hero__jars');
  if (jars && !reduce && window.matchMedia('(hover: hover)').matches) {
    var hero = jars.closest('.hero');
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      jars.style.setProperty('--mx', (((e.clientX - r.left) / r.width) - 0.5).toFixed(3));
      jars.style.setProperty('--my', (((e.clientY - r.top) / r.height) - 0.5).toFixed(3));
    });
  }

  /* ---------- 6. Scroll en la portada: los tarros suben ---------- */
  var jarsBox = document.querySelector('.hero__jars');
  if (jarsBox && !reduce) {
    var heroBox = jarsBox.closest('.hero'), jt = false;
    var lift = function () {
      var r = heroBox.getBoundingClientRect();
      var d = Math.min(Math.max(-r.top, 0), r.height) * 0.253;
      jarsBox.style.setProperty('--rise', d.toFixed(1));
      jt = false;
    };
    window.addEventListener('scroll', function () { if (!jt) { jt = true; requestAnimationFrame(lift); } }, { passive: true });
    lift();
  }

  /* ---------- 7. Títulos grandes: se escriben letra a letra al aparecer ---------- */
  if (!reduce) {
    $(TW_SEL).forEach(function (tw) {
      var lab = ''; (function txt(n) { Array.prototype.forEach.call(n.childNodes, function (c) { if (c.nodeType === 3) lab += c.nodeValue; else if (c.nodeName === 'BR') lab += ' '; else if (c.nodeType === 1) txt(c); }); })(tw);
      tw.setAttribute('aria-label', lab.replace(/\s+/g, ' ').trim());
      var chars = [];
      (function split(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (n) {
          if (n.nodeType === 3) {
            var frag = document.createDocumentFragment();
            n.nodeValue.split('').forEach(function (c) {
              if (/\s/.test(c)) { frag.appendChild(document.createTextNode(c)); return; }
              var sp = document.createElement('span'); sp.className = 'tw-ch'; sp.setAttribute('aria-hidden', 'true');
              sp.textContent = c; frag.appendChild(sp); chars.push(sp);
            });
            n.parentNode.replaceChild(frag, n);
          } else if (n.nodeType === 1) split(n);
        });
      })(tw);
      tw.classList.add('tw');
      /* títulos largos van más rápido para que ninguno tarde más de unos 2 s */
      var step = Math.min(75, Math.round(2000 / Math.max(chars.length, 1)));
      var k = 0, started = false;
      var type = function () {
        if (k < chars.length) {
          chars[k].classList.add('on'); k++;
          setTimeout(type, /[,.?]/.test(chars[k - 1].textContent) ? step * 3.5 : step);
        }
      };
      var start = function () { if (!started) { started = true; setTimeout(type, 250); } };
      /* empieza cuando el título entra en pantalla (comprobado al cargar y al hacer scroll) */
      var check = function () {
        var r = tw.getBoundingClientRect();
        if (r.top < innerHeight * 0.85 && r.bottom > 0) { start(); removeEventListener('scroll', check); removeEventListener('resize', check); }
      };
      addEventListener('scroll', check, { passive: true }); addEventListener('resize', check);
      check();
    });
  }
})();
