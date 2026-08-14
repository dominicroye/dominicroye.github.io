// Galeria de /project: la rejilla carga miniaturas ligeras (thumbs/), pero el
// lightbox debe abrir la imagen original. Cada <img> lleva la ruta del original
// en data-full; aqui la copiamos al href del enlace.
//
// IMPORTANTE: este fichero se carga con un <script src> sin defer/async situado
// justo despues de la galeria, para que se ejecute durante el parseo del HTML,
// antes de que Quarto inicialice GLightbox. GLightbox lee los href al
// inicializarse, asi que reescribirlos mas tarde (p. ej. en DOMContentLoaded)
// no tendria efecto.
(function () {
  var links = document.querySelectorAll('a.lightbox');
  for (var i = 0; i < links.length; i++) {
    var a = links[i];
    var img = a.querySelector('img[data-full]');
    if (!img) continue;
    var full = img.getAttribute('data-full');
    if (full) a.setAttribute('href', full);
  }
})();
