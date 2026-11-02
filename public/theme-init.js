// Applique le thème et les réglages d'affichage avant le démarrage d'Angular pour éviter un
// flash de couleurs ou un saut de mise en page.
// Chargé comme fichier externe (et non inline) pour respecter la CSP stricte.
(function () {
  try {
    var root = document.documentElement;
    var pref = localStorage.getItem('localatscv.theme');
    var dark =
      pref === 'dark' ||
      (pref !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) root.classList.add('dark');

    // Même format et mêmes classes que DisplayService (src/app/core/display).
    var display = JSON.parse(localStorage.getItem('localatscv.display') || 'null');
    if (display) {
      if (display.textSize === 'large' || display.textSize === 'xlarge') {
        root.setAttribute('data-text-size', display.textSize);
      }
      var classes = {
        readableFont: 'a11y-font',
        spacing: 'a11y-spacing',
        contrast: 'a11y-contrast',
        reduceMotion: 'a11y-motion',
      };
      (display.options || []).forEach(function (option) {
        if (classes[option]) root.classList.add(classes[option]);
      });
    }
  } catch (e) {
    // Stockage indisponible (navigation privée stricte) : réglages par défaut.
  }
})();
