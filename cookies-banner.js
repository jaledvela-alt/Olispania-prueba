/* Olispania · banner de consentimiento de cookies
   PREPARADO PERO APAGADO: la web hoy no usa cookies, así que no se muestra.
   Para activarlo el día que se añada analítica:
     1. Pon ACTIVO = true.
     2. Mete el código de la herramienta (p. ej. Google Analytics) dentro de cargarAnalitica().
     3. Añade en cada página, antes de </body>: <script src="cookies-banner.js" defer></script>
     4. Actualiza cookies.html (apartado 2 y 5).                                              */
(function () {
  'use strict';
  var ACTIVO = false;
  var CLAVE = 'olispania-cookies'; // 'si' | 'no'
  if (!ACTIVO) return;

  function cargarAnalitica() {
    /* Aquí va el código de analítica. Solo se ejecuta si la persona acepta. */
  }
  function leer() { try { return localStorage.getItem(CLAVE); } catch (e) { return null; } }
  function guardar(v) { try { localStorage.setItem(CLAVE, v); } catch (e) {} }

  var css = '' +
    '.ck{position:fixed;left:50%;bottom:20px;translate:-50% 0;z-index:60;width:min(760px,calc(100% - 32px));' +
    'background:#2F3D14;color:#F5EFE0;border-radius:20px;padding:20px 22px;display:flex;gap:18px 22px;align-items:center;flex-wrap:wrap;' +
    'box-shadow:0 18px 40px rgba(35,31,30,.28);font:400 15px/1.5 "DM Sans",system-ui,sans-serif;animation:ck-in .5s cubic-bezier(.2,.7,.2,1)}' +
    '.ck p{margin:0;flex:1 1 320px}.ck strong{font:600 18px/1.2 "Fraunces",Georgia,serif;display:block;margin-bottom:4px;color:#BED000}' +
    '.ck a{color:inherit;text-underline-offset:3px}.ck__btns{display:flex;gap:10px;flex-wrap:wrap}' +
    '.ck button{font:700 14px/1 "DM Sans",system-ui,sans-serif;border-radius:999px;padding:12px 20px;cursor:pointer;border:1.5px solid #F5EFE0}' +
    '.ck__si{background:#BED000;color:#0E3D33;border-color:#BED000!important}.ck__no{background:transparent;color:#F5EFE0}' +
    '.ck button:focus-visible{outline:3px solid #BED000;outline-offset:3px}' +
    '@keyframes ck-in{from{opacity:0;translate:-50% 16px}}@media (prefers-reduced-motion:reduce){.ck{animation:none}}';

  function mostrar() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    var box = document.createElement('div');
    box.className = 'ck'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Aviso de cookies');
    box.innerHTML = '<p><strong>¿Te parece bien una cookie?</strong>' +
      'Usamos cookies de analítica para saber qué páginas se visitan y mejorar la web. Solo las activamos si aceptas. ' +
      '<a href="cookies.html">Más información</a>.</p>' +
      '<div class="ck__btns"><button type="button" class="ck__no">Rechazar</button>' +
      '<button type="button" class="ck__si">Aceptar</button></div>';
    document.body.appendChild(box);
    box.querySelector('.ck__si').addEventListener('click', function () { guardar('si'); box.remove(); cargarAnalitica(); });
    box.querySelector('.ck__no').addEventListener('click', function () { guardar('no'); box.remove(); });
  }

  var v = leer();
  if (v === 'si') cargarAnalitica();
  else if (v !== 'no') mostrar();
})();
