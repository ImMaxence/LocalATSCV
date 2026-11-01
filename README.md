# LocalATSCV

Générateur de CV optimisé pour les ATS (logiciels de recrutement), **100 % local** : aucune donnée ne quitte le navigateur de l'utilisateur.

🌐 [localatscv.mbonnici.fr](https://localatscv.mbonnici.fr)

## Principes

- **Aucun backend** : le serveur ne fait que distribuer des fichiers statiques. Les CV et la photo sont stockés dans IndexedDB, sur l'appareil de l'utilisateur.
- **Vérifiable** : la politique de sécurité (CSP) servie par nginx interdit toute connexion vers un autre domaine (`connect-src 'self'`). Aucun journal d'accès, aucune statistique, polices auto-hébergées.
- **Hors ligne** : PWA installable, tout fonctionne sans connexion après le premier chargement.

## Stack

- Angular 22 (standalone, signals, zoneless), build statique sans SSR
- Tailwind CSS 4, polices Inter et Fraunces via Fontsource
- Transloco pour la traduction de l'interface (FR, EN)
- Dexie (IndexedDB) pour le stockage local
- Vitest pour les tests unitaires
- nginx (Docker) pour le service des fichiers

## Développement

```bash
npm install
npm start          # http://localhost:4200
npm run test:ci    # tests unitaires
npm run build      # build de production dans dist/localatscv/browser
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
