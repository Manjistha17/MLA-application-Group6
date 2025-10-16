<!--
Guidance for AI coding agents working on the MLA Fitness App repository.
Keep this file short (20-50 lines) and focused on concrete, discoverable patterns.
-->
# MLA Fitness App — Copilot / AI agent instructions

Short, actionable notes to help an AI agent be immediately productive in this repository.

- Big picture
  - This repo contains a small microservices-style app composed of:
    - Frontend (React) in `frontend/` served on port 80 in docker-compose.
    - Activity Tracking service (Node/Express/Mongo) in `activity-tracking/` on port 5300. See `activity-tracking/server.js` and routes in `activity-tracking/routes/exercises.js`.
    - Analytics service (Flask/Python) in `analytics/` on port 5050. See `analytics/app.py` for API routes (`/`, `/stats`, `/stats/<username>`, `/stats/weekly/`).
    - Auth service (Spring Boot Java) in `authservice/` on port 8080. Key endpoints: `/api/auth/signup` and `/api/auth/login` (see `AuthController.java`).
    - MongoDB container configured in `docker-compose.yml`. Connection string and credentials live in `activity-tracking/config.json` and the docker-compose env. Default root password: `cfgmla23`.

- Service boundaries & data flows
  - Frontend calls the Auth service at `http://localhost:8080/api/auth/*` for login/signup (see `frontend/src/components/login.js` and `signup.js`).
  - Frontend stores/uses a simple in-memory login state (React `useState`) — there is no JWT/session token implemented in this codebase.
  - Track exercise UI posts to Activity Tracking using the helper in `frontend/src/api.js` (search for `trackExercise`). Activity service exposes REST CRUD at `/exercises` (GET `/`, POST `/add`, GET `/:id`, DELETE `/:id`, PUT `/update/:id`).
  - Analytics queries MongoDB directly (configured by `MONGO_URI` env in docker-compose) and exposes aggregated stats.

- Important files to reference
  - `README.md` — developer quick-start and Docker instructions.
  - `docker-compose.yml` — service names and ports used in CI and local development.
  - `activity-tracking/server.js` and `activity-tracking/routes/exercises.js` — Node service entry and API contract.
  - `activity-tracking/config.json` — contains `mongoUri` used by the Node service in containerized runs.
  - `analytics/app.py` — Flask app and aggregation pipelines; useful when adding new analytics endpoints.
  - `authservice/src/.../AuthController.java` and `SecurityConfig.java` — shows auth endpoints and basic security config.

- Developer workflows & commands (executable / verified in repo)
  - Bring up all services with Docker: `docker-compose up --build` (recommended) or `docker-compose up`.
  - Run services individually (non-Docker):
    - Activity: `cd activity-tracking && npm install && nodemon server` (port 5300)
    - Analytics: `cd analytics && flask run -h localhost -p 5050` (port 5050)
    - Auth: `cd authservice && ./gradlew clean build && ./gradlew bootRun` (port 8080)
    - Frontend: `cd frontend && npm install && npm start` (dev server)
  - Quick environment check: `.devcontainer/check-installation.sh` (listed in README).

- Project-specific conventions & patterns
  - MongoDB is used by multiple services; prefer using the `mongoUri` from `activity-tracking/config.json` or `MONGO_URI` env when developing locally/containers.
  - The frontend assumes backend auth endpoints are on `localhost:8080` (hard-coded in components). Update components when proxying or introducing tokens.
  - No centralized API gateway: services communicate indirectly via MongoDB or via HTTP from frontend.
  - Minimal error handling is present — prefer preserving existing response shapes (strings or small JSON objects) when changing APIs.

- Integration points & external dependencies
  - MongoDB (container: `mongodb`) — connection: `mongodb://root:cfgmla23@mongodb:27017`.
  - AWS ECR deployment CI is configured in `.github/workflows/deploy.yml` (builds and pushes images for frontend, activity-tracking, authservice, analytics).

- Quick implementation checklist for common AI tasks
  - Adding an API route: update the appropriate service (Node `routes/`, Flask `app.py`, or Java controller), add tests if applicable, and update README if public contract changes.
  - Modifying frontend requests: check `frontend/src/components/*` for direct axios calls to `localhost:8080` or API helpers in `frontend/src/api.js`.
  - Database schema changes: update Mongoose models in `activity-tracking/models/` and ensure aggregation pipelines in `analytics/app.py` still match field names.

- When you cannot infer intent
  - If behavior or expected responses are not clear from code, open an issue and mark the change as "needs spec". Prefer minimal, non-breaking changes and leave TODO comments referencing file + line.

Please review and tell me if you'd like this expanded (examples for tests, lint rules, or CI details).
