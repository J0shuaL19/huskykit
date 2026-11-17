# Development and local verification

This is the development handoff for Chunzhang Liu's Academic Experiences and shared authentication. The final team README is intentionally deferred until both sections and submission assets are ready. Its existing disclosure remains unchanged.

## Prerequisites

- Node.js 22.13+ (Node 24 is suitable) and a recent npm. The project's current Vite/ESLint/MongoDB driver do not support Node 14.
- A running MongoDB server, or the team's Atlas URI with an allowed client IP.
- Do not commit `.env`, passwords, session secrets, or local database files.

## Run

From `backend`:

```sh
npm ci
```

Copy `.env.example` to `backend/.env`. Set `MONGODB_URI`, `MONGODB_DB`, and `SESSION_SECRET`. Generate a secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`. Keep this value only in the local environment file or deployment environment. The example's placeholder must be replaced.

```sh
npm run seed:academic
npm run seed:campus
npm start
```

Both seeds are additive and idempotent. The Academic seed adds 1,000 records; the existing Campus seed adds another 1,000. Demo records deliberately cannot be edited by registered users; register and publish your own post to demonstrate ownership and CRUD.

In a second terminal, from `frontend`:

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:5173`. The Vite proxy forwards `/api` to port 3000. Use the same hostname throughout the session. If you change the backend port, also update `frontend/vite.config.js`.

## Checks

From `frontend`: `npm run lint`, `npm run format:check`, `npm run build`.

From `backend`: `npm run lint`, `npm run format:check`, `npm test`.

For integration tests, set `MONGODB_TEST_URI` to a local or test MongoDB server, then run `npm run test:integration` from `backend`. The test creates a randomly named `huskykit_test_*` database and drops **only that database** after testing; the account must be allowed to create/drop a test database. The test skips if the variable is missing. It checks real MongoDB persistence, hashed passwords, duplicate usernames, session persistence across app instances, logout invalidation, owner-only writes, forged author fields, filters, pagination, and seed idempotence.

For a manual browser check: register → publish → read → edit → cancel deletion → confirm deletion → log out → log back in. Use a second account to verify another author's post has no edit/delete actions. Check anonymous search, empty results, invalid IDs, and a narrow/mobile viewport. Existing Campus browsing should continue working.

## Same-origin deployment preparation

The backend serves `frontend/dist` when it exists, including client-side route refreshes. From the repository root, the build command is:

```sh
npm ci --prefix backend && npm ci --prefix frontend && npm run build --prefix frontend
```

Start with `npm start --prefix backend`. Configure `MONGODB_URI`, `MONGODB_DB`, a strong `SESSION_SECRET`, and `NODE_ENV=production` in the host's secret environment settings. Use a host providing HTTPS and one trusted reverse proxy; production cookies require HTTPS. No separate frontend origin or CORS package is needed. This prepares deployment but does not claim the site has been deployed or verified publicly.

## Authentication references

- [Passport login sessions](https://www.passportjs.org/concepts/authentication/sessions/)
- [express-session options and store interface](https://expressjs.com/en/resources/middleware/session.html)
- [MongoDB Community downloads](https://www.mongodb.com/try/download/community)
