# X_auto — X (Twitter) Post Scheduling Bot

This project lets you schedule and automatically publish posts to X (Twitter) using a decoupled architecture:

- Node.js backend that runs the bot via Puppeteer
- React frontend to plan posts and manage the schedule
- Firebase (Web + Admin) integration for storage and orchestration

## Features

- Schedule X posts at specific times
- Frontend calendar interface (`frontend/src/components/X_bot_scheduler.jsx`)
- Automated posting via `backend/bot_runner.js`
- Store/read posts via Firebase and/or the local file `backend/posts.json`

## Project structure

```
backend/
  bot_runner.js            # Runs the posting bot
  posts.json               # Sample post data
  service-account-key.json # Firebase Admin service account key (do not commit publicly)
frontend/
  src/
    firebase_config.js     # Firebase Web config
    components/
      X_bot_scheduler.jsx  # UI scheduler component
package.json               # npm scripts and dependencies
```

## Prerequisites

- Node.js 18+ (recommended)
- A configured Firebase project
  - Admin SDK service account JSON in `backend/service-account-key.json`
  - Firebase Web config in `frontend/src/firebase_config.js`
- Access to the X (Twitter) account for automation (Puppeteer)

## Installation

From the project root, install dependencies:

```powershell
npm install
```

## Quick start

Run the development script to start the backend bot:

```powershell
npm run dev
```

By default, this runs `node backend/bot_runner.js`.

### Frontend (optional)

If you want to develop the React UI (`X_bot_scheduler.jsx`), you can either:

- Add and run a separate dev server (e.g., Vite/Next),
- Or integrate the component into your existing app.

Currently, `package.json` does not include a frontend dev server. Add one if needed.

## Configuration

- `.env` (optional) for variables (e.g., X credentials, Puppeteer settings). The project uses `dotenv`.
- `backend/service-account-key.json`: Firebase Admin service account JSON.
- `frontend/src/firebase_config.js`: export your Firebase Web app settings (`apiKey`, `authDomain`, `projectId`, etc.).

## Post data

- Example: `backend/posts.json` can contain an array of objects with the content and scheduled time.
- The frontend can read/write these posts via Firebase for orchestration.

## Troubleshooting

- Puppeteer: ensure system dependencies are present; on Windows, Puppeteer bundles Chromium automatically.
- X authentication: UI changes on X may require updates in `bot_runner.js`.
- Firebase: verify keys/permissions and that security rules allow required operations.

## Useful npm scripts

- `npm run dev` — start the bot in development (equivalent to `node backend/bot_runner.js`).
- `npm start` — start the bot (simple production).

## Security

Never commit `service-account-key.json` or sensitive credentials. Use environment variables and secret vaults.

## License

Private project. Add a license if needed.
