/* Filtros por etiquetas para la galeria de /project.
 *
 * - Las etiquetas viven en assets/gallery-tags.js (window.GALLERY_TAGS; clave "carpeta/nombre-sin-extension").
 * - Dentro de un grupo (Topic / Region) se combinan con OR; entre grupos, con AND.
 * - Las miniaturas filtradas se ocultan y se les quita la clase "lightbox", de modo
 *   que las flechas del lightbox solo recorren las laminas visibles.
 * - El estado se refleja en la URL (?topic=heat,sun&region=spain) para poder compartirlo.
 *
 * Se carga con <script src> normal (sin defer/async) al final de project/index.qmd.
 * No meter este codigo inline: Quarto escapa las comillas dobles dentro de <script>.
 */
(function () {
  'use strict';

  var mount = document.getElementById('gallery-filters');
  if (!mount) return;

  var norm = function (s) {
    try { s = decodeURIComponent(s); } catch (e) { /* ya estaba decodificado */ }
    return s.normalize('NFC');
  };

  var keyOf = function (img) {
    var m = norm(img.getAttribute('data-full') || '').match(/(climate|geography)\/([^\/]+)$/);
    return m ? m[1] + '/' + m[2].replace(/\.[^.]+$/, '') : null;
  };

  var css = [
    '#gallery-filters{width:90%;margin:0 auto 1.5rem;font-size:.9rem}',
    '#gallery-filters .gf-row{display:flex;flex-wrap:wrap;gap:.4rem;align-items:center;margin:.4rem 0}',
    '#gallery-filters .gf-label{font-weight:700;text-transform:uppercase;letter-spacing:.06em;font-size:.72rem;opacity:.7;min-width:4.5rem}',
    '#gallery-filters .gf-chip{border:1px solid rgba(128,128,128,.55);background:transparent;color:inherit;border-radius:999px;padding:.1rem .7rem;cursor:pointer;font:inherit;line-height:1.6}',
    '#gallery-filters .gf-chip:hover{border-color:var(--bs-primary,#2c7be5)}',
    '#gallery-filters .gf-chip[aria-pressed="true"]{background:var(--bs-primary,#2c7be5);border-color:var(--bs-primary,#2c7be5);color:#fff}',
    '#gallery-filters .gf-chip small{opacity:.65;margin-left:.3rem}',
    '#gallery-filters .gf-meta{display:flex;gap:1rem;align-items:center;margin-top:.6rem;opacity:.85}',
    '#gallery-filters .gf-clear{border:0;background:none;color:inherit;text-decoration:underline;cursor:pointer;font:inherit;padding:0}',
    '#gallery-filters .gf-clear[hidden]{display:none}'
  ].join('\n');
  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  if (window.GALLERY_TAGS) {
    init(window.GALLERY_TAGS);
  } else {
    console.warn('gallery-filters: falta assets/gallery-tags.js');
  }

  function init(data) {
    var tags = data.items;
    var groups = { topic: data.topics, region: data.regions };
    var state = { topic: new Set(), region: new Set() };

    var items = Array.prototype.slice.call(document.querySelectorAll('.grid-gallery img.grid-item')).map(function (img) {
      var key = keyOf(img);
      var tg = (key && tags[key]) || { t: [], r: '' };
      return {
        wrap: img.closest('.grid-gallery > *') || img.parentNode,
        link: img.closest('a'),
        t: tg.t,
        r: tg.r
      };
    });

    // Contadores por etiqueta
    var counts = { topic: {}, region: {} };
    items.forEach(function (it) {
      it.t.forEach(function (x) { counts.topic[x] = (counts.topic[x] || 0) + 1; });
      if (it.r) counts.region[it.r] = (counts.region[it.r] || 0) + 1;
    });

    // Estado inicial desde la URL
    var qs = new URLSearchParams(location.search);
    Object.keys(state).forEach(function (g) {
      (qs.get(g) || '').split(',').forEach(function (x) { if (x && groups[g][x]) state[g].add(x); });
    });

    // --- UI ---
    var chips = [];
    var labels = { topic: 'Topic', region: 'Region' };
    mount.textContent = '';
    ['topic', 'region'].forEach(function (g) {
      var row = document.createElement('div');
      row.className = 'gf-row';
      row.setAttribute('role', 'group');
      row.setAttribute('aria-label', labels[g]);
      var lab = document.createElement('span');
      lab.className = 'gf-label';
      lab.textContent = labels[g];
      row.appendChild(lab);
      Object.keys(groups[g]).forEach(function (id) {
        if (!counts[g][id]) return;
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'gf-chip';
        b.setAttribute('aria-pressed', 'false');
        b.appendChild(document.createTextNode(groups[g][id]));
        var n = document.createElement('small');
        n.textContent = counts[g][id];
        b.appendChild(n);
        b.addEventListener('click', function () {
          if (state[g].has(id)) state[g].delete(id); else state[g].add(id);
          apply();
        });
        chips.push({ g: g, id: id, el: b });
        row.appendChild(b);
      });
      mount.appendChild(row);
    });

    var meta = document.createElement('div');
    meta.className = 'gf-meta';
    var count = document.createElement('span');
    count.setAttribute('aria-live', 'polite');
    var clear = document.createElement('button');
    clear.type = 'button';
    clear.className = 'gf-clear';
    clear.textContent = 'Clear filters';
    clear.addEventListener('click', function () {
      state.topic.clear();
      state.region.clear();
      apply();
    });
    meta.appendChild(count);
    meta.appendChild(clear);
    mount.appendChild(meta);

    // --- Filtrado ---
    var galleries = ['gallery-climate', 'gallery-geo'];

    function apply() {
      var active = state.topic.size > 0 || state.region.size > 0;
      var shown = 0;

      items.forEach(function (it) {
        var okT = !state.topic.size || it.t.some(function (x) { return state.topic.has(x); });
        var okR = !state.region.size || state.region.has(it.r);
        var ok = okT && okR;
        if (ok) shown++;
        it.wrap.style.display = ok ? '' : 'none';
        if (it.link) {
          it.link.classList.toggle('lightbox', ok);
          it.link.classList.toggle('gf-off', !ok);
        }
      });

      // Oculta el encabezado de una galeria que se queda vacia
      galleries.forEach(function (id) {
        var g = document.getElementById(id);
        if (!g) return;
        var any = Array.prototype.some.call(g.querySelectorAll('.grid-gallery > *'), function (el) {
          return el.style.display !== 'none';
        });
        var sec = g.closest('section');
        (sec || g).style.display = any ? '' : 'none';
      });

      // Los videos de ANIMATIONS no tienen etiquetas: se ocultan mientras haya filtro
      var anim = document.getElementById('animations');
      if (anim) anim.style.display = active ? 'none' : '';

      chips.forEach(function (c) {
        c.el.setAttribute('aria-pressed', state[c.g].has(c.id) ? 'true' : 'false');
      });
      count.textContent = active ? shown + ' of ' + items.length + ' charts' : items.length + ' charts';
      clear.hidden = !active;

      // URL compartible
      var q = new URLSearchParams();
      Object.keys(state).forEach(function (g) {
        if (state[g].size) q.set(g, Array.from(state[g]).join(','));
      });
      var s = q.toString();
      try {
        history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
      } catch (e) { /* file:// no permite cambiar la URL */ }

      // Que el lightbox solo recorra las laminas visibles
      if (typeof lightboxQuarto !== 'undefined' && lightboxQuarto && lightboxQuarto.reload) {
        try { lightboxQuarto.reload(); } catch (e) { /* no critico */ }
      }
    }

    apply();
  }
})();
