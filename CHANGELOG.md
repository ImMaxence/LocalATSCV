# Changelog

Toutes les évolutions notables de LocalATSCV sont listées ici.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le projet respecte le [versionnage sémantique](https://semver.org/lang/fr/).

## [0.1.0] - 2026-11-01

### Ajouté

- Socle de l'application : Angular 22 en mode 100 % client, installable (PWA) et utilisable hors ligne.
- Landing page présentant le fonctionnement, la confidentialité et les fonctionnalités.
- Thème clair, sombre ou système, mémorisé sur l'appareil.
- Interface en français et en anglais, langue mémorisée sur l'appareil.
- Numéro de version affiché dans le pied de page, lu depuis `package.json`.
- Lien « Signaler un problème » ouvrant un ticket GitHub pré-rempli (version, navigateur, page), sans aucune donnée de CV.
- Notification lorsqu'une nouvelle version de l'application est disponible.
- Image Docker (nginx) avec politique de sécurité stricte (CSP), cache adapté au service worker et aucun journal d'accès.

[0.1.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.1.0
