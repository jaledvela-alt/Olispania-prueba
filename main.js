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
  var EN = document.documentElement.lang === 'en';
  var NUM = /\d[\d.,]*/;
  function parseEs(txt) {
    var m = txt.match(NUM); if (!m) return null;
    var raw = m[0], dec = 0;
    var D = EN ? '.' : ',', G = EN ? ',' : '.';
    if (raw.indexOf(D) > -1) dec = raw.split(D)[1].length;
    var val = parseFloat(raw.split(G).join('').replace(D, '.'));
    if (isNaN(val)) return null;
    return { raw: raw, val: val, dec: dec };
  }
  function fmt(v, dec) {
    return new Intl.NumberFormat(EN ? 'en-GB' : 'es-ES', { minimumFractionDigits: dec, maximumFractionDigits: dec, useGrouping: 'always' }).format(v);
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
  up.className = 'totop'; up.type = 'button'; up.setAttribute('aria-label', EN ? 'Back to top' : 'Volver arriba'); up.innerHTML = '<span aria-hidden="true"></span>';
  up.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  document.body.appendChild(up);
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
    box.innerHTML = (EN ? '<label for="buscar">Search products</label><input id="buscar" type="search" placeholder="Gherkins, banderillas, garlic…" autocomplete="off">' : '<label for="buscar">Buscar producto</label><input id="buscar" type="search" placeholder="Pepinillos, banderillas, ajos…" autocomplete="off">') + '<p class="finder__n" aria-live="polite"></p>';
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
      msg.textContent = q ? (n ? n + (EN ? (n === 1 ? ' product' : ' products') : (n === 1 ? ' producto' : ' productos')) : (EN ? 'No products with that name.' : 'No hay productos con ese nombre.')) : '';
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
