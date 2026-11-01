// Applique le thème avant le démarrage d'Angular pour éviter un flash de couleurs.
// Chargé comme fichier externe (et non inline) pour respecter la CSP stricte.
(function () {
  try {
    var pref = localStorage.getItem('localatscv.theme');
    var dark =
      pref === 'dark' ||
      (pref !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {
    // Stockage indisponible (navigation privée stricte) : on garde le thème clair.
  }
})();
