# LocalATSCV

**Le CV qui décroche l'entretien, prêt en quelques minutes.** Générateur de CV gratuit, sans inscription et sans publicité : 30 modèles, lettre de motivation assortie, adaptation à chaque offre d'emploi et vérification que le CV est bien lu par les logiciels qui trient les candidatures (ATS).

**100 % local** : tout se passe dans le navigateur, aucune donnée n'est envoyée sur un serveur.

🌐 [localatscv.mbonnici.fr](https://localatscv.mbonnici.fr)

![Éditeur de LocalATSCV : formulaire à gauche, aperçu du CV en direct à droite](docs/screenshots/editor-light.png)

## Aperçu

![Huit des modèles graphiques : Memphis, Duotone, Nocturne, Origami, Sorbet, Hexa, Typo et Ruban](docs/screenshots/templates-showcase.png)

| Version ciblée (Master CV)                                   | Mes CV                                                   |
| ------------------------------------------------------------ | -------------------------------------------------------- |
| ![Version ciblée](docs/screenshots/editor-version.png)       | ![Liste des CV](docs/screenshots/cv-list.png)            |
| **Lettre de motivation**                                     | **Tenir sur une page**                                   |
| ![Lettre de motivation](docs/screenshots/letter.png)         | ![Tenir sur une page](docs/screenshots/page-fit.png)     |
| **Adapter à une offre**                                      | **Import depuis LinkedIn**                               |
| ![Adapter à une offre](docs/screenshots/job-match.png)       | ![Import LinkedIn](docs/screenshots/import-linkedin.png) |
| **Galerie de modèles**                                       | **Analyseur de CV existant**                             |
| ![Galerie de modèles](docs/screenshots/templates.png)        | ![Analyseur](docs/screenshots/analyze.png)               |
| **Thème sombre**                                             | **Page d'accueil**                                       |
| ![Éditeur en thème sombre](docs/screenshots/editor-dark.png) | ![Accueil](docs/screenshots/landing-light.png)           |
| **Ce que lit un ATS**                                        | **Confidentialité**                                      |
| ![Vue robot](docs/screenshots/ats-robot-view.png)            | ![Confidentialité](docs/screenshots/privacy.png)         |

<p align="center">
  <img src="docs/screenshots/mobile-light.png" alt="Version mobile, thème clair" width="260" />
  &nbsp;&nbsp;
  <img src="docs/screenshots/mobile-dark.png" alt="Version mobile, thème sombre" width="260" />
</p>

Les captures se régénèrent avec `npm run screenshots` (application lancée via `npm run docker:local`, Edge ou Chrome installé), ainsi que l'image d'aperçu des liens `public/og-image.png`.

## Fonctionnalités

- [x] Page d'accueil grand public, sans jargon (CV d'exemple de boulangère adapté à chaque pays), thème clair/sombre, interface en 44 langues (dont 4 de droite à gauche), une URL par langue avec hreflang et sitemap
- [x] Master CV stocké dans IndexedDB, photo comprise, enregistrement automatique
- [x] Sauvegarde et restauration au format JSON
- [x] Éditeur avec aperçu A4 en direct, repères de sauts de page
- [x] Glisser-déposer des sections, des entrées et des puces (avec alternative au clavier)
- [x] Versions ciblées : cases à cocher pour composer un CV sur mesure sans rien supprimer
- [x] Langue du CV (FR, EN, IT, ES, DE) avec masquage automatique de la photo, de la date de naissance et de la nationalité en anglais
- [x] **30 modèles de CV**, dont 23 graphiques (Bento, Memphis, Bauhaus, Brutal, Duotone, Éditorial, Prisme, Nocturne, Sorbet, Origami, Hexa, Typo, Fil, Ruban, Zen…) : visuels pour le recruteur, lisibles par les ATS (vrai texte, dans l'ordre de lecture)
- [x] **Lettre de motivation** reprenant le design du CV, propre à chaque version ciblée
- [x] **Tenir sur une page** : espacements et taille du texte ajustés automatiquement ou à la main, sans titre orphelin en bas de page
- [x] **Annuler / Rétablir** (Ctrl+Z / Ctrl+Y) dans tout l'éditeur
- [x] 16 couleurs d'accent et couleur libre, 15 polices au choix, logos des liens, **QR code** vers le lien de son choix, permis de conduire
- [x] Niveau de langue guidé (A1 à C2, courant, natif…) avec aperçu de la jauge des modèles
- [x] **Contrôle ATS en direct** dans l'éditeur, avec le même moteur que l'analyseur
- [x] **Export PDF** textuel (fenêtre d'impression du navigateur), première page identique à l'aperçu
- [x] **Adapter à une offre** (LinkedIn, Indeed, HelloWork…) : mots-clés, score de correspondance, ajout des mots manquants, version ciblée générée
- [x] **Détecteur de phrases faibles** avec suggestions de verbes d'action, dans la langue du CV
- [x] **Import d'un CV existant (PDF ou Word .docx)**, du **PDF de profil LinkedIn** (ordinateur) ou de l'**archive de données LinkedIn** (application mobile)
- [x] Analyseur de CV existant (PDF lu dans le navigateur) : score sur 100 avec une méthode de calcul expliquée, points à corriger, texte tel que le lit un ATS, et détection des PDF dont le texte est écrit dans le désordre (piège des CV faits avec des blocs libres, type Canva)
- [x] Pages Nouveautés (générée à partir de `CHANGELOG.md`), mentions légales, CGU et confidentialité
- [x] **SEO et référencement IA** : pages publiques pré-générées en HTML, balises propres à chaque page, image d'aperçu, données structurées (WebSite, WebPage, WebApplication, FAQ), sitemap daté, `robots.txt` ouvert aux robots des IA, `llms.txt` et `llms-full.txt`, version Markdown de chaque page (`index.md`, aussi servie aux requêtes `Accept: text/markdown`)

## Principes

- **Aucun backend** : le serveur ne fait que distribuer des fichiers statiques. Les CV et la photo sont stockés dans IndexedDB, sur l'appareil de l'utilisateur.
- **Vérifiable** : la politique de sécurité (CSP) servie par nginx interdit toute connexion vers un autre domaine (`connect-src 'self'`). Aucun journal d'accès, aucune statistique, polices auto-hébergées.
- **Hors ligne** : PWA installable, tout fonctionne sans connexion après le premier chargement.

## Stack

- Angular 22 (standalone, signals, zoneless), build statique : les pages publiques sont pré-générées au build (SSG), l'éditeur est rendu dans le navigateur, aucun serveur applicatif
- Tailwind CSS 4, polices auto-hébergées via Fontsource (Inter, Fraunces, Poppins, Montserrat…)
- Transloco pour la traduction de l'interface (44 langues)
- Angular CDK (menus accessibles, puis glisser-déposer)
- Dexie (IndexedDB) pour le stockage local
- pdf.js pour lire les PDF (chargé uniquement à la demande), fflate pour l'archive LinkedIn, uqr pour les QR codes
- Vitest pour les tests unitaires
- nginx (Docker) pour le service des fichiers

## Développement

```bash
npm install
npm start          # http://localhost:4200
npm run test:ci    # tests unitaires (dont la cohérence des 44 fichiers de traduction)
npm run build      # build de production (pages publiques pré-générées) dans dist/localatscv/browser
```

Le service worker n'est actif qu'en build de production.

## Docker

```bash
npm run docker:local   # build + démarrage sur http://localhost:8090
npm run docker:down    # arrêt
```

`docker-compose.yml` ne publie aucun port (prévu pour Coolify) ; `docker-compose.local.yml` ajoute le port 8090 pour les tests locaux.

## Déploiement sur Coolify

1. Nouvelle ressource → dépôt Git `ImMaxence/LocalATSCV`, build pack **Docker Compose**.
2. Sur le service `web`, renseigner le domaine `https://localatscv.mbonnici.fr`. Le conteneur écoute sur le port 80.
3. Déployer. Coolify gère le certificat TLS ; le conteneur expose un healthcheck sur `/healthz`.

## Versions

La version affichée dans l'application est lue depuis `package.json`. Chaque version est décrite dans [CHANGELOG.md](CHANGELOG.md).

## Licence

[MIT](LICENSE) © Maxence Bonnici
