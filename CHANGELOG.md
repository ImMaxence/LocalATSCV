# Changelog

Toutes les évolutions notables de LocalATSCV sont listées ici

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le projet respecte le [versionnage sémantique](https://semver.org/lang/fr/)

## [Non publié]

### Ajouté

- Éditeur de CV : formulaire à gauche, aperçu A4 en direct à droite avec repères de sauts de page
- Page « Mes CV » avec vignettes, création d'un CV vierge ou à partir d'un exemple, duplication et suppression
- Enregistrement automatique dans IndexedDB, photo de profil comprise (redimensionnée dans le navigateur)
- Sauvegarde et restauration de tous les CV au format JSON
- Versions ciblées : cases à cocher sur chaque section, entrée et puce pour composer un CV sur mesure sans rien supprimer du Master CV
- Glisser-déposer des sections, des entrées et des puces, avec une alternative au clavier (Monter / Descendre)
- Langue du CV (FR, EN, IT, ES, DE) : titres de sections et dates traduits, photo, date de naissance et nationalité masquées en anglais
- Couleur d'accent du CV au choix
- Transitions animées entre les pages
- Interface traduite en italien, espagnol et allemand (5 langues au total)
- Nouveau menu de choix de la langue, accessible au clavier
- Captures d'écran dans le README, régénérables avec `npm run screenshots`

### Corrigé

- En-tête du site qui ne restait pas affiché en haut de l'écran pendant le défilement
- Texte coupé et léger défilement horizontal sur les petits écrans
- Navigation de l'en-tête qui débordait sur tablette
- Surlignages de la démo invisibles quand le système demande de réduire les animations

## [0.1.0] - 2026-11-01

### Ajouté

- Socle de l'application : Angular 22 en mode 100 % client, installable (PWA) et utilisable hors ligne
- Landing page présentant le fonctionnement, la confidentialité et les fonctionnalités
- Thème clair, sombre ou système, mémorisé sur l'appareil
- Interface en français et en anglais, langue mémorisée sur l'appareil
- Numéro de version affiché dans le pied de page, lu depuis `package.json`
- Lien « Signaler un problème » ouvrant un ticket GitHub pré-rempli (version, navigateur, page), sans aucune donnée de CV
- Notification lorsqu'une nouvelle version de l'application est disponible
- Image Docker (nginx) avec politique de sécurité stricte (CSP), cache adapté au service worker et aucun journal d'accès

[0.1.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.1.0
