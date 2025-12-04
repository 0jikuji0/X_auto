# X_auto — Bot de programmation de posts X (Twitter)

Ce projet permet de planifier et publier automatiquement des posts sur X (Twitter) en s'appuyant sur une architecture découplée:
- Backend Node.js qui exécute le bot via Puppeteer
- Frontend React pour planifier les posts et gérer l'agenda
- Intégration Firebase (Web + Admin) pour le stockage et l'orchestration

## Fonctionnalités
- Planification de posts X à des heures précises
- Interface de calendrier côté frontend (`frontend/src/components/X_bot_scheduler.jsx`)
- Exécution automatisée des publications via `backend/bot_runner.js`
- Stockage/lecture des posts via Firebase et/ou le fichier `backend/posts.json`

## Arborescence
```
backend/
  bot_runner.js            # Lance le bot de publication
  posts.json               # Exemple de données de posts
  service-account-key.json # Clé de service Firebase Admin (ne pas commiter publiquement)
frontend/
  src/
    firebase_config.js     # Config Firebase côté web
    components/
      X_bot_scheduler.jsx  # Planificateur côté UI
package.json               # Scripts npm et dépendances
```

## Prérequis
- Node.js 18+ (recommandé)
- Un projet Firebase configuré
  - Clé de service (Admin SDK) dans `backend/service-account-key.json`
  - Config Web Firebase dans `frontend/src/firebase_config.js`
- Accès au compte X (Twitter) pour l'automatisation (Puppeteer)

## Installation
Dans le dossier racine du projet, installez les dépendances:

```powershell
npm install
```

## Démarrage rapide
Le projet fournit un script de développement qui lance le bot backend:

```powershell
npm run dev
```

Par défaut, cela exécute `node backend/bot_runner.js`.

### Frontend (optionnel)
Si vous souhaitez développer l'UI React (`X_bot_scheduler.jsx`), vous pouvez soit:
- Lancer un serveur de développement séparé (si vous ajoutez un bundler comme Vite/Next),
- Ou intégrer le composant dans votre application existante.

Actuellement, le `package.json` n'inclut pas de serveur frontend (Vite/Next). Ajoutez-le si nécessaire.

## Configuration
- `.env` (optionnel) pour variables (ex: identifiants X, paramètres Puppeteer). Le projet utilise `dotenv`.
- `backend/service-account-key.json`: clé JSON du compte de service Firebase Admin.
- `frontend/src/firebase_config.js`: export des paramètres `apiKey`, `authDomain`, `projectId`, etc. de votre app Firebase Web.

## Données de posts
- Exemple: `backend/posts.json` peut contenir un tableau d'objets avec le contenu et l'heure planifiée.
- Le frontend peut écrire/lire ces posts depuis Firebase pour orchestration.

## Dépannage
- Puppeteer: assurez-vous que les dépendances système sont présentes; sur Windows, Puppeteer gère automatiquement Chromium.
- Authentification X: des changements d'UI côté X peuvent nécessiter des ajustements dans `bot_runner.js`.
- Firebase: vérifiez que les clés et permissions sont correctes et que les règles de sécurité autorisent les opérations nécessaires.

## Scripts npm utiles
- `npm run dev` — démarre le bot en mode développement (équivalent à `node backend/bot_runner.js`).
- `npm start` — démarre le bot (production simple).

## Sécurité
Ne commitez jamais `service-account-key.json` ni des identifiants sensibles. Utilisez des variables d'environnement et des coffres de secrets.

## Licence
Projet privé. Adapter une licence si nécessaire.
