# Changelog

Toutes les évolutions notables de LocalATSCV sont listées ici

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le projet respecte le [versionnage sémantique](https://semver.org/lang/fr/)

## [0.3.0] - 2026-11-01

### Ajouté

- Trois modèles graphiques pensés pour les ATS : Signature (formes organiques, grande photo ronde, frise chronologique), Aurore (une colonne, formes pastel) et Pulse (bandeau sombre en biais, cartes, pastilles)
- QR code dessiné dans le CV vers le lien de son choix (LinkedIn, GitHub, portfolio…), avec le logo du lien au centre
- Logos LinkedIn, GitHub, YouTube et Instagram devant les liens, globe pour les autres sites
- Permis de conduire dans le profil, affiché avec une icône de voiture
- Choix de la police des titres et du texte parmi 10 polices auto-hébergées (Poppins, Montserrat, Lora, Playfair Display…)
- Mise en gras de mots-clés dans les puces avec `**mot**`
- Import LinkedIn depuis l'application mobile : l'archive de données (ZIP) se lit directement dans le navigateur
- Section « Comment est calculée la note » dans l'analyseur, avec le détail des points de chaque critère

### Modifié

- Les CV en deux colonnes sont lus colonne par colonne pour les critères de contenu : seule la mise en page en colonnes est signalée
- Ligatures désactivées dans les CV pour que « fi » ou « ff » restent lisibles par tous les ATS
- Nouveau CV et exemple créés avec le modèle Aurore
- Modèles Impact et Pulse plus compacts : un CV d'une page tient sur une page à l'export

### Corrigé

- En-tête qui glissait sur le côté en allant vers une section de l'accueil (Confidentialité, Comment ça marche) depuis une autre page
- Sections de l'accueil en partie cachées sous l'en-tête après un clic dans le menu
- Libellé « Choisir un fichier » dans l'import LinkedIn, qui accepte aussi l'archive ZIP

## [0.2.0] - 2026-11-01

### Ajouté

- Export PDF depuis l'éditeur, avec un CV en texte réel et une première page identique à l'aperçu
- Modèle Impact : bandeau photo, icônes, frise chronologique et jauges de langue, en restant lisible par les ATS
- Icônes de contact et jauges de niveau de langue dans les modèles Moderne et Colonnes (dessins, invisibles pour les ATS)
- Contrôle ATS en direct dans l'éditeur : la mise en page affichée est notée avec le même moteur que l'analyseur
- Adapter un CV à une offre (LinkedIn, Indeed, HelloWork…) : mots-clés de l'annonce, score de correspondance, ajout des mots-clés manquants et création d'une version ciblée pré-remplie
- Détection des formulations faibles dans les puces, avec des verbes d'action proposés dans la langue du CV
- Import d'un CV PDF existant dans l'éditeur, y compris le PDF de profil exporté depuis LinkedIn
- Bouton « Reprendre ce CV dans nos modèles » dans l'analyseur
- Pages Mentions légales, Conditions d'utilisation et Politique de confidentialité
- Six modèles de CV : Classique, Moderne, Élégant, Tech, Minimal et Colonnes, avec un aperçu de son propre CV dans chacun et leur compatibilité ATS
- Analyseur de CV existant : un PDF créé avec n'importe quel outil est lu dans le navigateur, noté sur 100, avec les points à corriger et le texte tel que le lit un ATS
- Page Nouveautés générée à partir de ce journal des modifications
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

- Page Nouveautés : affichage de la version en cours au lieu de « Prochaine version »
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

[0.3.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.3.0
[0.2.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.2.0
[0.1.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.1.0
