# Changelog

Toutes les évolutions notables de LocalATSCV sont listées ici

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le projet respecte le [versionnage sémantique](https://semver.org/lang/fr/)

## [0.7.0] - 2026-11-02

### Ajouté

- Version Markdown de chaque page publique dans chaque langue (/index.md, /en/analyze/index.md…), aussi servie à la même adresse aux assistants qui demandent du Markdown (Accept: text/markdown)
- Fichier llms-full.txt : tout le texte du site en français et en anglais, pour les assistants
- Analyseur : le barème (critères et points) est affiché avant même de déposer un CV

### Modifié

- robots.txt : les robots des moteurs de recherche et des assistants IA y sont listés explicitement
- Plan du site daté (lastmod) et données structurées sur chaque page publique (site, page, application, FAQ)
- Texte servi en UTF-8 explicite et compressé, Markdown compris

### Corrigé

- Accueil : « Vos données jamais » n'était pas séparé d'une espace pour les lecteurs d'écran, et les numéros d'étapes décoratifs y étaient lus

## [0.6.0] - 2026-11-02

### Ajouté

- Interface traduite en 44 langues, dont l'arabe, l'hébreu, le persan et l'ourdou lus de droite à gauche
- Une adresse par langue pour les pages publiques (/en, /ja, /pt-br/analyze…), avec balises hreflang, canonique et plan du site généré automatiquement au build
- Sélecteur de langue avec champ de recherche (nom natif, nom traduit ou code) et navigation au clavier
- Bandeau proposant la langue du navigateur lors d'une première visite, et liens vers toutes les langues en pied de page
- Démo de la page d'accueil traduite, avec un CV d'exemple dans la langue de l'interface

### Modifié

- Mise en page en propriétés logiques (début/fin) pour que l'interface s'inverse proprement en mode droite à gauche ; l'aperçu du CV reste de gauche à droite
- Traductions de l'interface chargées à la demande au lieu d'être toutes mises en cache hors ligne dès la première visite

## [0.5.0] - 2026-11-01

### Ajouté

- Dix nouveaux modèles : Memphis, Duotone, Typo, Sorbet, Exécutif, Zen, Ruban, Hexa, Origami et Fil, soit 30 modèles au total
- Lettre de motivation reprenant le design du CV choisi : destinataire, objet, formules d'usage dans la langue du CV, trame à compléter, export PDF dédié ; chaque version ciblée peut avoir sa propre lettre
- Bouton « Tenir sur une page » : les espacements puis la taille du texte sont réduits juste assez, avec des réglages manuels et un retour à la mise en page du modèle
- Annuler et rétablir dans tout l'éditeur (Ctrl+Z, Ctrl+Y), avec des boutons dans la barre d'outils
- Import d'un CV Word (.docx), lu dans le navigateur comme les PDF : paragraphes, tableaux, zones de texte et en-têtes de page
- Bouton « Voir en noir et blanc » au-dessus de l'aperçu, pour juger d'une impression en niveaux de gris (le PDF garde ses couleurs)
- Analyseur : nouveau critère « Ordre de lecture du fichier », qui repère les PDF dont le texte est écrit dans le désordre (piège des CV faits avec des blocs libres, type Canva), et vue « Ordre du fichier » du texte lu par le robot

### Modifié

- Galerie de modèles : vignettes montrées avec un CV d'exemple complet (photo d'illustration comprise) ou avec son propre CV, rendues au fil du défilement, et indicateur de chargement sur le bouton
- Modèle Origami : coordonnées dans le bandeau et couches de papier en bande séparée, sans rien recouvrir
- Modèle Zen : le sceau carré est remplacé par un ensō (cercle zen tracé au pinceau)
- Barème de l'analyseur rééquilibré pour faire place au nouveau critère (lisibilité toujours sur 40 points)
- Détection des colonnes plus fiable sur les PDF découpés mot par mot
- Pages légales complétées : éditeur particulier (adresse et téléphone sur demande), hébergement personnel à Aix-en-Provence derrière Cloudflare, crédits (polices, icônes, bibliothèques), cookies et droits des utilisateurs

### Corrigé

- Un titre de section ne reste plus seul en bas de page sur les CV de plusieurs pages
- Modèle Zen : un titre en capitales espacées pouvait être lu en deux mots par les ATS
- Modèle Pulse : fin liseré gris sous le bandeau dans l'aperçu

## [0.4.0] - 2026-11-01

### Ajouté

- Dix nouveaux modèles graphiques et lisibles par les ATS : Bento, Bauhaus, Brutal, Éditorial, Prisme, Nocturne (mode sombre), Vague, Blueprint, Suisse et Prestige, soit 20 modèles au total
- Filtre Tous / Graphiques / Sobres dans la galerie de modèles
- 16 couleurs d'accent et un sélecteur de couleur libre
- Cinq nouvelles polices : Jost, Bricolage Grotesque, Archivo, Syne et Cormorant Garamond
- Niveau de langue : suggestions (A1 à C2, courant, langue maternelle…), explication et aperçu en direct de la jauge affichée par les modèles
- Pages publiques pré-générées en HTML (accueil, analyseur, nouveautés, pages légales) : leur contenu est lisible par les moteurs de recherche et par les robots des IA, qui n'exécutent pas JavaScript
- Référencement : description et adresse canonique propres à chaque page, image d'aperçu des liens, données structurées (application web et FAQ), sitemap, robots.txt et llms.txt
- Trois nouvelles questions dans la FAQ : modèles graphiques et ATS, import d'un CV ou du profil LinkedIn, fonctionnement hors ligne

### Modifié

- Polices des CV chargées seulement quand un CV s'affiche : la page d'accueil est plus légère
- Le contrôle ATS en direct attend le chargement des polices avant de mesurer la mise en page
- Export PDF : le fond du modèle (sombre, ivoire, quadrillé…) remplit aussi les marges des pages suivantes

### Corrigé

- Ordre du texte dans les PDF exportés avec Aurore, Signature, Pulse, Impact et Moderne : l'en-tête ou les expériences étaient écrits dans le fichier après le reste, et les ATS qui lisent le PDF dans l'ordre du fichier les retrouvaient à la fin

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

[0.7.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.7.0
[0.6.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.6.0
[0.5.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.5.0
[0.4.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.4.0
[0.3.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.3.0
[0.2.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.2.0
[0.1.0]: https://github.com/ImMaxence/LocalATSCV/releases/tag/v0.1.0
