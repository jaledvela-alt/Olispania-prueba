/* Olispania · filtros de productos (productos.html)
   Dentro de cada grupo los filtros suman (O); entre grupos se combinan (Y).
   Sin JavaScript se ve la lista completa. Los filtros se guardan en la URL. */
(function () {
  var shop = document.querySelector('.shop');
  if (!shop) return;
  var $ = function (s, r) { return Array.prototype.slice.call((r || shop).querySelectorAll(s)); };
  var grid = shop.querySelector('.shop__grid');
  var cards = $('.shop__card');
  var boxes = $('.shop__fs input[type=checkbox]');
  var keys = ['tipo', 'sabor', 'fmt', 'gama', 'envase'];
  var q = shop.querySelector('#shop-q');
  var sort = shop.querySelector('#shop-sort');
  var count = shop.querySelector('.shop__n');
  var empty = shop.querySelector('.shop__empty');
  var active = shop.querySelector('.shop__active');
  var gamas = shop.querySelector('.shop__gamas');
  var sortBox = shop.querySelector('.shop__sort');
  var showAll = false;
  var EN = document.documentElement.lang === 'en', FR = document.documentElement.lang === 'fr', LOC = EN ? 'en' : (FR ? 'fr' : 'es');
  var nGamas = gamas.querySelectorAll('.tile').length;
  var toggle = shop.querySelector('.shop__toggle');
  var badge = shop.querySelector('.shop__badge');
  var panel = shop.querySelector('.shop__f');
  var norm = function (s) { return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); };
  var order = cards.slice();
  cards.forEach(function (c) { c._txt = norm(c.textContent); c._name = norm(c.querySelector('h3').textContent); c._ml = +c.dataset.ml; });

  function selected() {
    var s = {};
    keys.forEach(function (k) { s[k] = boxes.filter(function (b) { return b.name === k && b.checked; }).map(function (b) { return b.value; }); });
    return s;
  }
  function matches(c, s, skip) {
    var text = norm(q.value.trim());
    if (text && text.split(/\s+/).some(function (w) { return c._txt.indexOf(w) < 0; })) return false;
    return keys.every(function (k) {
      if (k === skip || !s[k].length) return true;
      var vals = (c.dataset[k] || '').split(' ');
      return s[k].some(function (v) { return vals.indexOf(v) > -1; });
    });
  }
  function apply(push) {
    var s = selected(), n = 0, total = 0;
    var filtering = showAll || !!q.value.trim() || keys.some(function (k) { return s[k].length; });
    cards.forEach(function (c) { var ok = matches(c, s); c.hidden = !ok; if (ok) n++; });
    // sin filtros: solo las gamas; con filtros o buscador: productos
    gamas.hidden = filtering; grid.hidden = !filtering; sortBox.hidden = !filtering;
    count.textContent = filtering ? n + (EN ? (n === 1 ? ' product' : ' products') : FR ? (n === 1 ? ' produit' : ' produits') : (n === 1 ? ' producto' : ' productos')) : nGamas + (EN ? ' ranges' : FR ? ' gammes' : ' gamas');
    empty.hidden = !filtering || n > 0;
    // recuento por opción (sin contar el propio grupo) y opciones vacías atenuadas
    boxes.forEach(function (b) {
      var c = cards.filter(function (x) { return matches(x, s, b.name) && (x.dataset[b.name] || '').split(' ').indexOf(b.value) > -1; }).length;
      b.parentNode.querySelector('.shop__c').textContent = '(' + c + ')';
      b.parentNode.classList.toggle('is-off', c === 0 && !b.checked);
    });
    // etiquetas de filtros activos
    active.innerHTML = '';
    boxes.forEach(function (b) {
      if (!b.checked) return; total++;
      var li = document.createElement('li');
      var btn = document.createElement('button'); btn.type = 'button';
      btn.textContent = b.parentNode.querySelector('span').textContent;
      btn.setAttribute('aria-label', (EN ? 'Remove filter ' : FR ? 'Retirer le filtre ' : 'Quitar filtro ') + btn.textContent);
      btn.addEventListener('click', function () { b.checked = false; apply(true); });
      li.appendChild(btn); active.appendChild(li);
    });
    badge.hidden = !total; badge.textContent = total;
    if (push) {
      var p = new URLSearchParams();
      keys.forEach(function (k) { if (s[k].length) p.set(k, s[k].join(',')); });
      if (q.value.trim()) p.set('q', q.value.trim());
      if (sort.value !== 'tipo') p.set('orden', sort.value);
      if (showAll) p.set('todos', '1');
      var url = location.pathname + (p.toString() ? '?' + p.toString() : '') + '#buscador';
      try { history.replaceState(null, '', url); } catch (e) {}
    }
  }
  function doSort() {
    var v = sort.value, list = order.slice();
    if (v === 'az') list.sort(function (a, b) { return a._name.localeCompare(b._name, LOC); });
    if (v === 'za') list.sort(function (a, b) { return b._name.localeCompare(a._name, LOC); });
    if (v === 'ml-asc') list.sort(function (a, b) { return a._ml - b._ml || a._name.localeCompare(b._name, LOC); });
    if (v === 'ml-desc') list.sort(function (a, b) { return b._ml - a._ml || a._name.localeCompare(b._name, LOC); });
    list.forEach(function (c) { grid.appendChild(c); });
  }
  function reset() { boxes.forEach(function (b) { b.checked = false; }); q.value = ''; showAll = false; apply(true); }

  // estado inicial desde la URL
  var p = new URLSearchParams(location.search);
  keys.forEach(function (k) {
    var v = (p.get(k) || '').split(',');
    boxes.forEach(function (b) { if (b.name === k && v.indexOf(b.value) > -1) b.checked = true; });
  });
  if (p.get('q')) q.value = p.get('q');
  showAll = p.get('todos') === '1';
  if (p.get('orden') && sort.querySelector('option[value="' + p.get('orden') + '"]')) sort.value = p.get('orden');

  boxes.forEach(function (b) { b.addEventListener('change', function () { apply(true); }); });
  q.addEventListener('input', function () { apply(true); });
  sort.addEventListener('change', function () { doSort(); apply(true); });
  $('.shop__reset, .shop__reset-link').forEach(function (b) { b.addEventListener('click', reset); });
  toggle.addEventListener('click', function () {
    var open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', open); panel.classList.toggle('is-open', open);
  });
  shop.classList.add('is-ready');
  doSort(); apply(false);
})();
