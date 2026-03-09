# Shakti 360 - MLA Fitness App

Full-stack fitness platform built with microservices. The app supports authentication, exercise logging, workout plans, nutrition and hydration tracking, and observability with Prometheus/Grafana.

## Team (Group 6)

- Haritha Nallimilli
- Sagarika Bohidar
- Ramya V
- Pon Divya Ravichandran
- Manjistha Mukherjee
- Sandhya Salian

## Current Architecture

The production-style local stack runs behind Nginx on port `8081`.

```text
Browser
  -> Nginx (frontend container, host port 8081)
     -> /                 React app
     -> /api/auth/*       Auth Service (Spring Boot, 8080)
     -> /api/admin/*      Auth Admin APIs (Spring Boot, 8080)
     -> /exercises/*      Activity Tracking (Node/Express, 5300)
     -> /api/stats/*      Analytics (Flask, 5050)
     -> /nutrition/*      Nutrition API (Node/Express, 5005)
     -> /workouts/*       Workout API (FastAPI, 8000)
```

## Services and Tech Stack

| Service | Stack | Internal Port | Exposed Host Port |
|---|---|---:|---:|
| Frontend + Reverse Proxy (`nginx`) | React + Nginx | 80 | 8081 |
| Activity Tracking | Node.js + Express + Mongoose | 5300 | not exposed |
| Analytics | Python Flask + PyMongo | 5050 | not exposed |
| Auth Service | Java Spring Boot (Gradle, Java 17) | 8080 | not exposed |
| Nutrition API | Node.js + Express + Mongoose | 5005 | 5005 |
| Workout API | FastAPI + Motor | 8000 | 8000 |
| Prometheus | Prometheus | 9090 | 9090 |
| Alertmanager | Alertmanager | 9093 | 9093 |
| Grafana | Grafana | 3000 | 3000 |
| Loki | Loki | 3100 | 3100 |
| Promtail | Promtail | 9080 | not exposed |

## Core Features

- Authentication and profile management (signup, login, password reset, email verification).
- Activity logging with exercise type, sub-activity, duration, and weekly summaries.
- Daily/weekly analytics including calorie estimation and activity streak data.
- Nutrition logging with JWT-protected APIs.
- AI-assisted nutrition features:
  - `/nutrition/ai-lookup` for calories/macros.
  - `/nutrition/ai-suggest` for meal suggestions.
- Workout planning with master plan lookup, per-user plan creation, and completion tracking.
- Observability with service metrics, dashboards, and alert routing.

## API Routing (through Nginx `http://localhost:8081`)

- Auth: `/api/auth/*`
- Admin: `/api/admin/*`
- Activity: `/exercises/*`
- Analytics: `/api/stats/*`
- Nutrition: `/nutrition/*`
- Workout: `/workouts/*`
- Swagger (Auth service):
  - `/swagger-ui/`
  - `/v3/api-docs`

## Running the Project

### Prerequisites

- Docker and Docker Compose

### 1) Start full stack

```bash
docker compose up --build
```

### 2) Access URLs

- App: `http://localhost:8081`
- Workout API direct: `http://localhost:8000`
- Nutrition API direct: `http://localhost:5005`
- Prometheus: `http://localhost:9090`
- Alertmanager: `http://localhost:9093`
- Grafana: `http://localhost:3000` (default `admin` / `admin`)

### 3) Optional UI-only dev container (hot reload)

```bash
docker compose -f docker-compose.ui-dev.yml up --build
```

UI dev server: `http://localhost:3000`

## Environment Variables

The current codebase uses a mix of compose-provided env vars and service-local config.

### Required for `nutrition-api`

- `ANTHROPIC_API_KEY` (required for AI endpoints)
- `JWT_SECRET` (optional, defaults in code if not set)
- `MONGO_URI` (set in compose)

### Required for `analytics` and `workout-api`

- `MONGO_URI`
- `MONGO_DB`

### Notes

- `activity-tracking` currently reads Mongo URI from `activity-tracking/config.json`.
- `authservice` currently uses values from `authservice/src/main/resources/application.properties`.

## Monitoring and Alerting

- Prometheus scrape targets are configured in `prometheus/prometheus.yml`.
- Alert rules are configured in `prometheus/alert_rules.yml`.
- Alertmanager config is in `prometheus/alertmanager.yml`.
- Grafana provisioning and dashboards are in `grafana/provisioning` and `grafana/dashboards`.

Service metrics endpoints:

- Auth: `/actuator/prometheus`
- Activity Tracking: `/metrics`
- Analytics: `/metrics`
- Workout API: `/metrics`

## Testing

Examples from current repo:

- Frontend: `cd frontend && npm test`
- Activity service: `cd activity-tracking && npm test`
- Analytics (Docker-based): `cd analytics && docker compose -f docker-compose.tests.yml up --build --abort-on-container-exit`

## Repository Structure

- `frontend/` React app + Nginx config
- `authservice/` Java Spring Boot auth/admin service
- `activity-tracking/` Exercise logging service
- `analytics/` Stats and calorie analytics service
- `nutrition-api/` Nutrition + AI service
- `workout-api/` FastAPI workout plan service
- `prometheus/` Prometheus, alerts, and Alertmanager config
- `grafana/` Grafana provisioning and dashboards
