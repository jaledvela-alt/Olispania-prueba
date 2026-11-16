/* Olispania · interactivo.js (2026-11-11)
   1. Lista de muestras: botón en fichas y gamas, contador flotante, lista + formulario en Contacto
   2. «Encuentra tu aceituna»: test de 3 preguntas en Productos
   3. «Tu marca blanca en 3 pasos»: asistente en Contacto (y acceso desde la portada)
   Los formularios abren el correo, igual que el formulario de contacto. */
(function () {
  'use strict';
  var d = document, html = d.documentElement;
  var L = (html.lang || 'es').slice(0, 2); if (L !== 'en' && L !== 'fr') L = 'es';
  var me = d.currentScript && d.currentScript.src || '';
  var ROOT = me.replace(/interactivo\.js.*$/, '');           // raíz de la web (con barra final)
  var LROOT = ROOT + (L === 'es' ? '' : L + '/');          // raíz del idioma actual
  var MAIL = 'olispania@olispania.es';
  var KEY = 'oli-muestras';

  function t(o) { return o[L] || o.es; }
  function el(tag, cls, txt) { var e = d.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function mailto(subject, body) { location.href = 'mailto:' + MAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body); }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(a) { try { localStorage.setItem(KEY, JSON.stringify(a)); } catch (e) {} render(); }

  var TX = {
    add: { es: 'Añadir a mi lista de muestras', en: 'Add to my sample list', fr: 'Ajouter à ma liste d’échantillons' },
    added: { es: 'En tu lista de muestras ✓', en: 'In your sample list ✓', fr: 'Dans votre liste ✓' },
    addGama: { es: 'Pedir muestra de esta gama', en: 'Request a sample of this range', fr: 'Demander un échantillon de cette gamme' },
    pill: { es: 'Mi lista de muestras', en: 'My sample list', fr: 'Ma liste d’échantillons' },
    mTitle: { es: 'Tu lista de muestras.', en: 'Your sample list.', fr: 'Votre liste d’échantillons.' },
    mLead: { es: 'Elige productos con el botón «Añadir a mi lista de muestras» en cada ficha y pídelos aquí de una vez.', en: 'Pick products with the «Add to my sample list» button on each product page and request them here in one go.', fr: 'Choisissez des produits avec le bouton « Ajouter à ma liste d’échantillons » sur chaque fiche et demandez-les ici en une fois.' },
    mEmpty: { es: 'Todavía no has añadido productos.', en: 'You haven’t added any products yet.', fr: 'Vous n’avez encore ajouté aucun produit.' },
    mSee: { es: 'Ver productos', en: 'See products', fr: 'Voir les produits' },
    remove: { es: 'Quitar', en: 'Remove', fr: 'Retirer' },
    name: { es: 'Nombre', en: 'Name', fr: 'Nom' },
    company: { es: 'Empresa', en: 'Company', fr: 'Entreprise' },
    email: { es: 'Tu email', en: 'Your email', fr: 'Votre e-mail' },
    country: { es: 'País', en: 'Country', fr: 'Pays' },
    notes: { es: 'Comentarios (opcional)', en: 'Comments (optional)', fr: 'Commentaires (facultatif)' },
    priv: { es: 'Acepto la <a href="' + ROOT + 'privacidad.html" target="_blank" rel="noopener">política de privacidad</a>.', en: 'I accept the <a href="' + ROOT + 'privacidad.html" target="_blank" rel="noopener">privacy policy</a>.', fr: 'J’accepte la <a href="' + ROOT + 'privacidad.html" target="_blank" rel="noopener">politique de confidentialité</a>.' },
    mSend: { es: 'Pedir muestras', en: 'Request samples', fr: 'Demander des échantillons' },
    mSubj: { es: 'Solicitud de muestras (web)', en: 'Sample request (website)', fr: 'Demande d’échantillons (site web)' },
    next: { es: 'Siguiente', en: 'Next', fr: 'Suivant' },
    back: { es: 'Atrás', en: 'Back', fr: 'Retour' },
    step: { es: 'Paso', en: 'Step', fr: 'Étape' },
    of: { es: 'de', en: 'of', fr: 'sur' }
  };

  /* ================= 1. LISTA DE MUESTRAS ================= */
  var pill;
  function render() {
    var a = load();
    if (pill) { pill.hidden = !a.length || !!d.getElementById('muestras'); pill.querySelector('b').textContent = a.length; }
    d.querySelectorAll('.smp-btn').forEach(function (b) {
      var on = a.some(function (x) { return x.id === b.dataset.id; });
      b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', on);
      b.textContent = on ? t(TX.added) : b.dataset.label;
    });
    var box = d.getElementById('smp-list'); if (box) fillList(box, a);
  }
  function addButton(where, item, label) {
    var b = el('button', 'btn btn--line smp-btn'); b.type = 'button';
    b.dataset.id = item.id; b.dataset.label = label; b.setAttribute('aria-pressed', 'false');
    b.addEventListener('click', function () {
      var a = load(), i = a.findIndex(function (x) { return x.id === item.id; });
      if (i > -1) a.splice(i, 1); else a.push(item);
      save(a);
      if (i === -1 && pill) { pill.classList.remove('is-bump'); void pill.offsetWidth; pill.classList.add('is-bump'); }
    });
    where.appendChild(b);
  }
  // ficha de producto
  var prodBtns = d.querySelector('.prod__btn'), h1 = d.querySelector('main h1');
  if (prodBtns && h1) {
    var fmt = d.querySelector('.prod__chips li'), img = d.querySelector('.prod__fig img');
    addButton(prodBtns, { id: location.pathname.split('/').pop(), name: h1.textContent.trim(), fmt: fmt ? fmt.textContent.trim() : '', img: img ? img.getAttribute('src').replace(/^(\.\.\/)+/, '') : '', url: location.pathname.split('/').slice(-2).join('/') }, t(TX.add));
  }
  // página de gama
  var gamaBtns = d.querySelector('.chero__btn');
  if (gamaBtns && h1) {
    var jar = d.querySelector('.chero__jars img, .chero__img img');
    addButton(gamaBtns, { id: location.pathname.split('/').pop(), name: h1.textContent.trim(), fmt: t({ es: 'gama completa', en: 'whole range', fr: 'gamme complète' }), img: jar ? jar.getAttribute('src').replace(/^(\.\.\/)+/, '') : '', url: location.pathname.split('/').pop() }, t(TX.addGama));
  }
  // contador flotante
  pill = el('a', 'smp-pill'); pill.href = LROOT + 'contacto.html#muestras'; pill.hidden = true;
  pill.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 3h6M10 3v5.5L5.2 17a2.6 2.6 0 0 0 2.3 4h9a2.6 2.6 0 0 0 2.3-4L14 8.5V3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg><span>' + esc(t(TX.pill)) + '</span><b>0</b>';
  d.body.appendChild(pill);

  function fillList(box, a) {
    box.innerHTML = '';
    if (!a.length) {
      var p = el('p', 'smp-empty', t(TX.mEmpty) + ' ');
      var go = el('a', '', t(TX.mSee) + ' →'); go.href = LROOT + 'productos.html'; p.appendChild(go); box.appendChild(p); return;
    }
    var ul = el('ul', 'smp-items');
    a.forEach(function (x) {
      var li = el('li');
      if (x.img) { var im = el('img'); im.src = ROOT + x.img; im.alt = ''; im.loading = 'lazy'; li.appendChild(im); }
      var tx = el('div'); tx.appendChild(el('strong', '', x.name)); if (x.fmt) tx.appendChild(el('span', '', x.fmt)); li.appendChild(tx);
      var rm = el('button', 'smp-rm', '×'); rm.type = 'button'; rm.setAttribute('aria-label', t(TX.remove) + ' ' + x.name);
      rm.addEventListener('click', function () { save(load().filter(function (y) { return y.id !== x.id; })); });
      li.appendChild(rm); ul.appendChild(li);
    });
    box.appendChild(ul);
  }
  function fields(withNotes) {
    return '<div class="ix-grid">' +
      '<label>' + t(TX.name) + '<input name="nombre" required autocomplete="name"></label>' +
      '<label>' + t(TX.company) + '<input name="empresa" required autocomplete="organization"></label>' +
      '<label>' + t(TX.email) + '<input name="email" type="email" required autocomplete="email"></label>' +
      '<label>' + t(TX.country) + '<input name="pais" required autocomplete="country-name"></label></div>' +
      (withNotes ? '<label>' + t(TX.notes) + '<textarea name="notas" rows="3"></textarea></label>' : '') +
      '<label class="check"><input type="checkbox" required> <span>' + t(TX.priv) + '</span></label>';
  }
  function who(f) { return '\n\n' + f.get('nombre') + ' · ' + f.get('empresa') + ' · ' + f.get('pais') + '\n' + f.get('email'); }

  var contact = d.getElementById('contacto');
  if (contact && d.getElementById('form')) {
    var sec = el('section', 'ix ix--smp'); sec.id = 'muestras';
    sec.innerHTML = '<div class="wrap ix__in"><header class="ix__head"><p class="claim claim--leaf">' + t({ es: 'Muestras', en: 'Samples', fr: 'Échantillons' }) + '</p><h2>' + t(TX.mTitle) + '</h2><p>' + t(TX.mLead) + '</p></header>' +
      '<div class="ix__card"><div id="smp-list"></div><form class="ix-form" id="smp-form">' + fields(true) + '<button class="btn btn--red" type="submit">' + t(TX.mSend) + '</button></form></div></div>';
    contact.parentNode.insertBefore(sec, contact.nextSibling);
    d.getElementById('smp-form').addEventListener('submit', function (e) {
      e.preventDefault(); var a = load(), f = new FormData(e.target);
      if (!a.length) { d.getElementById('smp-list').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      var body = t({ es: 'Hola, me gustaría recibir muestras de:', en: 'Hello, I would like to receive samples of:', fr: 'Bonjour, je souhaiterais recevoir des échantillons de :' }) + '\n' +
        a.map(function (x) { return '- ' + x.name + (x.fmt ? ' (' + x.fmt + ')' : ''); }).join('\n') +
        (f.get('notas') ? '\n\n' + f.get('notas') : '') + who(f);
      mailto(t(TX.mSubj), body);
    });
  }
  render();
  addEventListener('storage', render);

  /* ================= 2. ENCUENTRA TU ACEITUNA ================= */
  var P = {
    'serie-oro': { n: { es: 'Serie Oro', en: 'Serie Oro', fr: 'Serie Oro' }, i: 'img/prod/serie-oro-lata-2kg.webp', m: 'casa tienda', s: 'clasico relleno', f: 'tarro lata', r: 'focaccia-rellenas' },
    'aceitunas-verdes-rellenas': { n: { es: 'Aceitunas verdes rellenas de anchoa', en: 'Green olives stuffed with anchovy', fr: 'Olives vertes farcies à l’anchois' }, i: 'img/prod/lata-lata-5kg-anchoa-negra.webp', m: 'casa barra tienda', s: 'relleno', f: 'tarro lata granel', r: 'focaccia-rellenas' },
    'aceitunas-verdes-rellenas-extragrandes': { n: { es: 'Aceitunas verdes rellenas de anchoa extragrandes', en: 'Extra large green olives stuffed with anchovy', fr: 'Olives vertes farcies à l’anchois extra-grosses' }, i: 'img/prod/lata-lata-2kg-extragrandes.webp', m: 'barra casa', s: 'relleno', f: 'lata tarro', r: 'focaccia-rellenas' },
    '10-onzas-sabores': { n: { es: 'Aceitunas verdes rellenas de sabores', en: 'Flavoured stuffed green olives', fr: 'Olives vertes farcies aux saveurs' }, i: 'img/prod/10oz-limon.webp', m: 'casa tienda', s: 'relleno', f: 'tarro', r: 'focaccia-rellenas' },
    'aceitunas-manzanillas-verdes-con-hueso': { n: { es: 'Aceitunas verdes con hueso', en: 'Whole green olives', fr: 'Olives vertes avec noyau' }, i: 'img/prod/lata-con-hueso-5kg.webp', m: 'barra cocina', s: 'clasico', f: 'granel', r: 'pincho-manzanilla' },
    'aceitunas-verdes-sin-hueso': { n: { es: 'Aceitunas verdes sin hueso', en: 'Pitted green olives', fr: 'Olives vertes dénoyautées' }, i: 'img/prod/lata-sin-hueso-5kg.webp', m: 'cocina barra', s: 'clasico', f: 'granel', r: 'tapenade-verde' },
    'aceitunas-verdes-partidas-chupadedos': { n: { es: 'Aceitunas verdes partidas aliñadas «Chupadedos»', en: 'Cracked seasoned green olives «Chupadedos»', fr: 'Olives vertes cassées assaisonnées « Chupadedos »' }, i: 'img/prod/lata-5kg-chupadedos.webp', m: 'casa barra tienda', s: 'alinado', f: 'granel tarro', r: 'pan-tomate-partidas' },
    'aceitunas-verdes-partidas-alinadas': { n: { es: 'Aceitunas verdes partidas aliñadas «Sabor de la abuela María»', en: 'Cracked seasoned green olives «Grandma María’s recipe»', fr: 'Olives vertes cassées assaisonnées « Saveur de la grand-mère María »' }, i: 'img/prod/lata-abuela-5kg.webp', m: 'casa barra tienda', s: 'alinado', f: 'granel tarro', r: 'pan-tomate-partidas' },
    'mojo-picon': { n: { es: 'Aceitunas verdes partidas aliñadas «Mojo picón»', en: 'Cracked seasoned green olives «Mojo picón»', fr: 'Olives vertes cassées assaisonnées « Mojo picón »' }, i: 'img/prod/lata-mojo-5kg.webp', m: 'barra casa', s: 'alinado', f: 'granel tarro', r: 'pan-tomate-partidas' },
    'aceitunas-en-rodajas': { n: { es: 'Aceitunas en rodajas', en: 'Sliced olives', fr: 'Olives en rondelles' }, i: 'img/prod/lata-rodajas-verdes.webp', m: 'cocina', s: 'clasico', f: 'lata', r: 'ensalada-rodajas' },
    'surtido-de-aceitunas-y-encurtidos': { n: { es: 'Cocktail de aceitunas y encurtidos', en: 'Olive and pickle cocktail', fr: 'Cocktail d’olives et de cornichons' }, i: 'img/prod/lata-cocktail-2kg.webp', m: 'casa barra tienda', s: 'encurtido', f: 'lata granel tarro', r: 'tabla-surtido' },
    'pepinillos-en-vinagre': { n: { es: 'Pepinillos en vinagre', en: 'Gherkins in vinegar', fr: 'Cornichons au vinaigre' }, i: 'img/prod/lata-pepinillos-10kg.webp', m: 'cocina casa tienda', s: 'encurtido', f: 'granel tarro', r: 'tosta-pepinillo' },
    'aceitunas-negras-cacerenas-con-hueso': { n: { es: 'Aceitunas negras', en: 'Black olives', fr: 'Olives noires' }, i: 'img/prod/lata-negras-ch-5kg.webp', m: 'cocina casa', s: 'clasico', f: 'granel tarro', r: 'tosta-negras-queso' }
  };
  var R = {
    'tapenade-verde': { es: 'Tapenade de aceituna verde', en: 'Green olive tapenade', fr: 'Tapenade d’olives vertes' },
    'tosta-negras-queso': { es: 'Tosta de aceitunas negras y queso fresco', en: 'Black olive and fresh cheese toast', fr: 'Toast d’olives noires et fromage frais' },
    'ensalada-rodajas': { es: 'Ensalada fresca con aceitunas en rodajas', en: 'Fresh salad with sliced olives', fr: 'Salade fraîche aux olives en rondelles' },
    'pan-tomate-partidas': { es: 'Pan con tomate y aceitunas partidas', en: 'Tomato bread with cracked olives', fr: 'Pain à la tomate et aux olives cassées' },
    'pincho-manzanilla': { es: 'Pincho de manzanilla, queso y jamón', en: 'Manzanilla olive, cheese and ham skewer', fr: 'Brochette d’olive manzanilla, fromage et jambon' },
    'focaccia-rellenas': { es: 'Focaccia con aceitunas rellenas', en: 'Focaccia with stuffed olives', fr: 'Focaccia aux olives farcies' },
    'tosta-pepinillo': { es: 'Tosta de pepinillo y salmón ahumado', en: 'Gherkin and smoked salmon toast', fr: 'Toast de cornichon et saumon fumé' },
    'tabla-surtido': { es: 'Tabla de aperitivo con surtido', en: 'Appetiser board with assortment', fr: 'Planche d’apéritif avec assortiment' }
  };
  var Q = [
    { k: 'm', q: { es: '¿Para qué las quieres?', en: 'What are they for?', fr: 'Pour quoi faire ?' }, o: [
      ['casa', { es: 'Aperitivo en casa', en: 'Aperitivo at home', fr: 'Apéritif à la maison' }],
      ['barra', { es: 'Tapas en mi bar o restaurante', en: 'Tapas in my bar or restaurant', fr: 'Tapas dans mon bar ou restaurant' }],
      ['cocina', { es: 'Cocinar: ensaladas, tostas, salsas', en: 'Cooking: salads, toasts, sauces', fr: 'Cuisiner : salades, toasts, sauces' }],
      ['tienda', { es: 'Venderlas en mi tienda o cadena', en: 'Selling them in my shop or chain', fr: 'Les vendre dans mon magasin ou ma chaîne' }]] },
    { k: 's', q: { es: '¿Qué sabor te pide el cuerpo?', en: 'Which flavour are you craving?', fr: 'Quelle saveur vous fait envie ?' }, o: [
      ['clasico', { es: 'Clásico y suave', en: 'Classic and mild', fr: 'Classique et doux' }],
      ['relleno', { es: 'Rellenas: anchoa, limón, pimiento…', en: 'Stuffed: anchovy, lemon, pepper…', fr: 'Farcies : anchois, citron, poivron…' }],
      ['alinado', { es: 'Aliñadas, con carácter', en: 'Seasoned, full of character', fr: 'Assaisonnées, avec du caractère' }],
      ['encurtido', { es: 'Encurtidos y mezcla', en: 'Pickles and mixes', fr: 'Cornichons et mélanges' }]] },
    { k: 'f', q: { es: '¿Qué formato necesitas?', en: 'Which format do you need?', fr: 'Quel format vous faut-il ?' }, o: [
      ['tarro', { es: 'Tarro de cristal', en: 'Glass jar', fr: 'Bocal en verre' }],
      ['lata', { es: 'Lata (2 kg, 10–12 oz)', en: 'Tin (2 kg, 10–12 oz)', fr: 'Boîte (2 kg, 10–12 oz)' }],
      ['granel', { es: 'Gran formato (5–10 kg)', en: 'Large format (5–10 kg)', fr: 'Grand format (5–10 kg)' }]] }
  ];
  var shop = d.querySelector('.shop');
  if (false && shop) { /* test «¿Cuál es tu aceituna?» desactivado a petición de Jaled (2026-11-11) */
    var qz = el('section', 'ix ix--quiz'); qz.id = 'encuentra';
    qz.innerHTML = '<div class="wrap ix__in"><div class="ix__card oq">' +
      '<div class="oq__intro"><p class="claim claim--leaf">' + t({ es: 'Test rápido', en: 'Quick oq', fr: 'Test rapide' }) + '</p><h2>' + t({ es: '¿Cuál es <em>tu aceituna?</em>', en: 'Which olive <em>is yours?</em>', fr: 'Quelle olive <em>est la vôtre ?</em>' }) + '</h2><p>' + t({ es: 'Tres preguntas y te decimos cuáles van contigo, con una receta para estrenarlas.', en: 'Three questions and we’ll tell you which ones suit you, with a recipe to try them.', fr: 'Trois questions et nous vous disons lesquelles vous conviennent, avec une recette pour les goûter.' }) + '</p></div>' +
      '<div class="oq__body" aria-live="polite"></div></div></div>';
    shop.parentNode.insertBefore(qz, shop);
    var body = qz.querySelector('.oq__body'), ans = {};
    var show = function (i) {
      body.innerHTML = '';
      if (i >= Q.length) return result();
      var q = Q[i];
      var bar = el('div', 'ix-steps'); bar.innerHTML = Q.map(function (_, j) { return '<i' + (j <= i ? ' class="on"' : '') + '></i>'; }).join('');
      body.appendChild(bar);
      body.appendChild(el('p', 'ix-step', t(TX.step) + ' ' + (i + 1) + ' ' + t(TX.of) + ' ' + Q.length));
      body.appendChild(el('h3', 'oq__q', t(q.q)));
      var opts = el('div', 'ix-opts');
      q.o.forEach(function (o) {
        var b = el('button', 'ix-opt' + (ans[q.k] === o[0] ? ' is-on' : ''), t(o[1])); b.type = 'button';
        b.addEventListener('click', function () { ans[q.k] = o[0]; show(i + 1); });
        opts.appendChild(b);
      });
      body.appendChild(opts);
      if (i > 0) { var bk = el('button', 'ix-back', '← ' + t(TX.back)); bk.type = 'button'; bk.addEventListener('click', function () { show(i - 1); }); body.appendChild(bk); }
      if (i > 0) { var h = body.querySelector('.oq__q'); h.tabIndex = -1; h.focus({ preventScroll: true }); }
    };
    var result = function () {
      var sc = Object.keys(P).map(function (id) {
        var p = P[id], s = 0;
        if (p.m.indexOf(ans.m) > -1) s += 2;
        if (p.s.indexOf(ans.s) > -1) s += 3;
        if (p.f.indexOf(ans.f) > -1) s += 2;
        return [id, s];
      }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 3);
      body.appendChild(el('p', 'ix-step', t({ es: 'Te recomendamos', en: 'We recommend', fr: 'Nous vous recommandons' })));
      var ul = el('ul', 'oq__res');
      sc.forEach(function (x) {
        var p = P[x[0]], li = el('li'), a = el('a'); a.href = LROOT + x[0] + '.html';
        a.innerHTML = '<img src="' + ROOT + p.i + '" alt="" loading="lazy"><span>' + esc(t(p.n)) + '</span>';
        li.appendChild(a); ul.appendChild(li);
      });
      body.appendChild(ul);
      var rid = P[sc[0][0]].r, rec = el('p', 'oq__rec');
      rec.innerHTML = t({ es: 'Para estrenarlas:', en: 'To try them:', fr: 'Pour les goûter :' }) + ' <a href="' + LROOT + 'recetas.html#' + rid + '">' + esc(t(R[rid])) + ' →</a>';
      body.appendChild(rec);
      var again = el('button', 'ix-back', '↺ ' + t({ es: 'Repetir el test', en: 'Take the oq again', fr: 'Refaire le test' })); again.type = 'button';
      again.addEventListener('click', function () { ans = {}; show(0); });
      body.appendChild(again);
    };
    show(0);
  }

  /* ================= 3. MARCA BLANCA EN 3 PASOS ================= */
  var MB = {
    title: { es: 'Tu marca blanca <em>en 3 pasos.</em>', en: 'Your private label <em>in 3 steps.</em>', fr: 'Votre marque de distributeur <em>en 3 étapes.</em>' },
    lead: { es: 'Envasamos para la gran distribución y el food service con la marca del distribuidor, en vidrio y en lata. Cuéntanos qué necesitas y te preparamos una propuesta.', en: 'We pack for retail and food service under the retailer’s own brand, in glass and in tins. Tell us what you need and we’ll prepare a proposal.', fr: 'Nous conditionnons pour la grande distribution et la restauration sous la marque du distributeur, en verre et en boîte. Dites-nous ce dont vous avez besoin et nous préparerons une proposition.' },
    s1: { es: '¿En qué envase?', en: 'Which packaging?', fr: 'Quel emballage ?' },
    s2: { es: '¿Qué productos y formatos?', en: 'Which products and formats?', fr: 'Quels produits et formats ?' },
    s3: { es: '¿Cuánto volumen y a quién enviamos la propuesta?', en: 'What volume, and who should we send the proposal to?', fr: 'Quel volume, et à qui envoyer la proposition ?' },
    vid: { es: 'Vidrio', en: 'Glass', fr: 'Verre' }, lat: { es: 'Lata', en: 'Tin', fr: 'Boîte' }, amb: { es: 'Los dos', en: 'Both', fr: 'Les deux' },
    prods: { es: 'Productos', en: 'Products', fr: 'Produits' }, fmts: { es: 'Formatos', en: 'Formats', fr: 'Formats' },
    vol: { es: 'Volumen aproximado', en: 'Approximate volume', fr: 'Volume approximatif' },
    send: { es: 'Enviar solicitud', en: 'Send request', fr: 'Envoyer la demande' },
    subj: { es: 'Solicitud de marca blanca (web)', en: 'Private label request (website)', fr: 'Demande de marque de distributeur (site web)' },
    pick: { es: 'Elige al menos una opción.', en: 'Choose at least one option.', fr: 'Choisissez au moins une option.' },
    cta: { es: 'Tu marca blanca en 3 pasos', en: 'Your private label in 3 steps', fr: 'Votre marque de distributeur en 3 étapes' }
  };
  var PRODS = [
    { es: 'Verdes con hueso', en: 'Whole green', fr: 'Vertes avec noyau' }, { es: 'Verdes sin hueso', en: 'Pitted green', fr: 'Vertes dénoyautées' },
    { es: 'Rellenas (anchoa y sabores)', en: 'Stuffed (anchovy and flavours)', fr: 'Farcies (anchois et saveurs)' }, { es: 'Partidas aliñadas', en: 'Cracked and seasoned', fr: 'Cassées assaisonnées' },
    { es: 'Negras', en: 'Black', fr: 'Noires' }, { es: 'En rodajas', en: 'Sliced', fr: 'En rondelles' },
    { es: 'Encurtidos y cocktail', en: 'Pickles and cocktail', fr: 'Cornichons et cocktail' }
  ];
  var FMT = { vidrio: ['212 ml', '314 ml', '370 ml', '445 ml', '500 ml', '850 ml', '½ galón', 'Galón'], lata: ['10 oz', '12 oz', 'A-10', '2 kg', '5 kg', '10 kg'] };
  var VOL = [
    { es: 'Menos de 1 palé', en: 'Less than 1 pallet', fr: 'Moins d’une palette' }, { es: 'De 1 a 5 palés', en: '1 to 5 pallets', fr: '1 à 5 palettes' },
    { es: 'Un contenedor completo', en: 'A full container', fr: 'Un conteneur complet' }, { es: 'Varios contenedores al año', en: 'Several containers a year', fr: 'Plusieurs conteneurs par an' }
  ];
  if (contact && d.getElementById('form')) {
    var mb = el('section', 'ix ix--mb'); mb.id = 'marca-blanca';
    var chip = function (name, val, type) { return '<label class="ix-chip"><input type="' + (type || 'checkbox') + '" name="' + name + '" value="' + esc(val) + '"><span>' + esc(val) + '</span></label>'; };
    mb.innerHTML = '<div class="wrap ix__in"><header class="ix__head"><p class="claim claim--leaf">' + t({ es: 'Marca del distribuidor', en: 'Private label', fr: 'Marque de distributeur' }) + '</p><h2>' + t(MB.title) + '</h2><p>' + t(MB.lead) + '</p></header>' +
      '<form class="ix__card ix-form mb" id="mb-form" novalidate>' +
      '<div class="ix-steps"><i class="on"></i><i></i><i></i></div><p class="ix-step" id="mb-n"></p>' +
      '<fieldset class="mb__s" data-s="1"><legend>' + t(MB.s1) + '</legend><div class="ix-opts ix-opts--3">' +
        '<label class="ix-opt ix-opt--r"><input type="radio" name="envase" value="vidrio" required><span>' + t(MB.vid) + '</span></label>' +
        '<label class="ix-opt ix-opt--r"><input type="radio" name="envase" value="lata"><span>' + t(MB.lat) + '</span></label>' +
        '<label class="ix-opt ix-opt--r"><input type="radio" name="envase" value="ambos"><span>' + t(MB.amb) + '</span></label></div></fieldset>' +
      '<fieldset class="mb__s" data-s="2" hidden><legend>' + t(MB.s2) + '</legend><p class="mb__lab">' + t(MB.prods) + '</p><div class="ix-chips">' + PRODS.map(function (p) { return chip('prod', t(p)); }).join('') + '</div>' +
        '<p class="mb__lab">' + t(MB.fmts) + '</p><div class="ix-chips" id="mb-fmts"></div></fieldset>' +
      '<fieldset class="mb__s" data-s="3" hidden><legend>' + t(MB.s3) + '</legend><p class="mb__lab">' + t(MB.vol) + '</p><div class="ix-chips">' + VOL.map(function (v) { return chip('vol', t(v), 'radio'); }).join('') + '</div>' + fields(true) + '</fieldset>' +
      '<p class="mb__err" role="alert" hidden>' + t(MB.pick) + '</p>' +
      '<div class="mb__nav"><button type="button" class="ix-back" id="mb-back" hidden>← ' + t(TX.back) + '</button><button type="button" class="btn btn--red" id="mb-next">' + t(TX.next) + '</button><button type="submit" class="btn btn--red" id="mb-send" hidden>' + t(MB.send) + '</button></div>' +
      '</form></div>';
    var after = d.getElementById('muestras') || contact;
    after.parentNode.insertBefore(mb, after.nextSibling);
    var form = d.getElementById('mb-form'), cur = 1, err = form.querySelector('.mb__err');
    var setFmts = function () {
      var env = (form.querySelector('[name=envase]:checked') || {}).value, list = env === 'vidrio' ? FMT.vidrio : env === 'lata' ? FMT.lata : FMT.vidrio.concat(FMT.lata);
      var keep = [].map.call(form.querySelectorAll('[name=fmt]:checked'), function (x) { return x.value; });
      d.getElementById('mb-fmts').innerHTML = list.map(function (f) { return chip('fmt', f); }).join('');
      keep.forEach(function (v) { var c = form.querySelector('[name=fmt][value="' + v + '"]'); if (c) c.checked = true; });
    };
    var go = function (n) {
      cur = n; err.hidden = true;
      form.querySelectorAll('.mb__s').forEach(function (s) { s.hidden = +s.dataset.s !== n; });
      form.querySelectorAll('.ix-steps i').forEach(function (b, j) { b.classList.toggle('on', j < n); });
      d.getElementById('mb-n').textContent = t(TX.step) + ' ' + n + ' ' + t(TX.of) + ' 3';
      d.getElementById('mb-back').hidden = n === 1; d.getElementById('mb-next').hidden = n === 3; d.getElementById('mb-send').hidden = n !== 3;
      if (n === 2) setFmts();
    };
    var ok = function (n) {
      if (n === 1) return !!form.querySelector('[name=envase]:checked');
      if (n === 2) return !!form.querySelector('[name=prod]:checked');
      return true;
    };
    d.getElementById('mb-next').addEventListener('click', function () { if (!ok(cur)) { err.hidden = false; return; } go(cur + 1); form.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
    d.getElementById('mb-back').addEventListener('click', function () { go(cur - 1); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      var f = new FormData(form), lst = function (k) { return f.getAll(k).join(', ') || '—'; };
      var env = f.get('envase'), envT = t(env === 'vidrio' ? MB.vid : env === 'lata' ? MB.lat : MB.amb);
      var body = t({ es: 'Hola, me interesa fabricar con mi marca:', en: 'Hello, I am interested in a private label:', fr: 'Bonjour, je suis intéressé par une marque de distributeur :' }) + '\n\n' +
        t({ es: 'Envase', en: 'Packaging', fr: 'Emballage' }) + ': ' + envT + '\n' + t(MB.prods) + ': ' + lst('prod') + '\n' + t(MB.fmts) + ': ' + lst('fmt') + '\n' + t(MB.vol) + ': ' + lst('vol') +
        (f.get('notas') ? '\n\n' + f.get('notas') : '') + who(f);
      mailto(t(MB.subj), body);
    });
    go(1);
  }
  // acceso desde la portada, junto al párrafo de la marca del distribuidor
  var wel = d.querySelector('.welcome__text');
  if (wel) {
    var c = el('p', 'ix-cta'), a2 = el('a', 'btn btn--line', t(MB.cta) + ' →'); a2.href = LROOT + 'contacto.html#marca-blanca';
    c.appendChild(a2); wel.appendChild(c);
  }
  // si se llega con #muestras o #marca-blanca, bajar a la sección ya creada
  if (/^#(muestras|marca-blanca|encuentra)$/.test(location.hash)) { var tg = d.querySelector(location.hash); if (tg) setTimeout(function () { tg.scrollIntoView(); }, 450); }

  /* ================= 4. CALCULADORA PARA HOSTELERÍA (fichas de producto) ================= */
  var dl = d.querySelector('.prod__dl');
  if (dl) {
    var grams = 0, big = false;
    dl.querySelectorAll('div').forEach(function (r) {
      var k = (r.querySelector('dt') || {}).textContent || '';
      if (/^(formato|format)$/i.test(k.trim())) big = /kg|A-10|gal/i.test((r.querySelector('dd') || {}).textContent || '');
      if (/escurrido|drained|égoutté/i.test(k)) grams = parseInt(((r.querySelector('dd') || {}).textContent || '').replace(/\D/g, ''), 10) || 0;
    });
    if (big && grams >= 100) { /* solo gran formato: kg, A-10 y galones */
      var CT = {
        h: { es: '¿Cuántas raciones salen?', en: 'How many servings do you get?', fr: 'Combien de portions ?' },
        sub: { es: 'Calculadora para hostelería con el peso escurrido de este envase', en: 'Food service calculator based on this pack’s drained weight', fr: 'Calculateur pour la restauration selon le poids égoutté de ce format' },
        size: { es: 'Tamaño de la ración', en: 'Serving size', fr: 'Taille de la portion' },
        day: { es: 'Raciones que sirves al día', en: 'Servings you serve per day', fr: 'Portions servies par jour' },
        per: { es: 'raciones por envase', en: 'servings per pack', fr: 'portions par format' },
        week: { es: 'envases a la semana', en: 'packs per week', fr: 'formats par semaine' },
        note: { es: 'Peso escurrido', en: 'Drained weight', fr: 'Poids égoutté' }
      };
      var SZ = [[15, { es: 'Aperitivo', en: 'Nibble', fr: 'Apéritif' }], [30, { es: 'Tapa', en: 'Tapa', fr: 'Tapa' }], [60, { es: 'Media ración', en: 'Half portion', fr: 'Demi-portion' }], [100, { es: 'Ración', en: 'Full portion', fr: 'Portion' }]];
      var nf = function (n) { return n.toLocaleString(L === 'en' ? 'en-GB' : L === 'fr' ? 'fr-FR' : 'es-ES'); };
      var cw = el('section', 'ix__card calc'); cw.setAttribute('aria-label', t(CT.h));
      cw.innerHTML = '<p class="ix-step">' + t({ es: 'Para hostelería', en: 'For food service', fr: 'Pour la restauration' }) + '</p><h2 class="calc__h">' + t(CT.h) + '</h2><p class="calc__sub">' + t(CT.sub) + ' (' + nf(grams) + ' g).</p>' +
        '<div class="calc__row"><span class="mb__lab">' + t(CT.size) + '</span><div class="ix-chips" role="radiogroup">' +
        SZ.map(function (z, i) { return '<label class="ix-chip"><input type="radio" name="calc-sz" value="' + z[0] + '"' + (i === 1 ? ' checked' : '') + '><span>' + esc(t(z[1])) + ' · ' + z[0] + ' g</span></label>'; }).join('') + '</div></div>' +
        '<label class="calc__row calc__day"><span class="mb__lab">' + t(CT.day) + '</span><span class="calc__range"><input type="range" min="5" max="300" step="5" value="40" name="calc-day"><output>40</output></span></label>' +
        '<div class="calc__out"><p><b data-o="per">0</b><span>' + t(CT.per) + '</span></p><p><b data-o="week">0</b><span>' + t(CT.week) + '</span></p></div>';
      var info = d.querySelector('.prod__info') || dl.parentNode;
      info.appendChild(cw);
      var upd = function () {
        var sz = +(cw.querySelector('[name=calc-sz]:checked') || {}).value || 30, day = +cw.querySelector('[name=calc-day]').value;
        cw.querySelector('output').textContent = day;
        var per = Math.floor(grams / sz), wk = per ? Math.ceil(day * 7 / per) : 0;
        cw.querySelector('[data-o=per]').textContent = nf(per);
        cw.querySelector('[data-o=week]').textContent = nf(wk);
      };
      cw.addEventListener('input', upd); cw.addEventListener('change', upd); upd();
    }
  }
})();
