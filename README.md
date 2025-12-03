# MLA Fitness App

An interactive fitness tracking application built with a polyglot microservices architecture. Users can log exercises, monitor progress, and view analytics in real time.

![Screenshot](screenshots/frontpage.png?v=2)

## Architecture Overview

This app now uses a multi-service architecture with distinct backend services for activity tracking, analytics, and user management. Requests flow through a reverse proxy and SPA frontend, with CORS and security handled uniformly across services.

## Tech Stack by Layer

| Layer | Technology Used |
|-------|----------------|
| Reverse Proxy | Nginx (Routing, Auth, CORS, Error Handling) |
| Frontend | React SPA served via Nginx |
| Activity Service | Node.js (Port 5000) |
| Analytics Service | Python Flask (Port 5050) |
| User Service | Java + Gradle (Port 8080) |
| Database | MongoDB |

## Features

- User registration and login via Java-based Auth Service
- Real-time activity tracking with Node.js
- Weekly and overall analytics via Python Flask
- Interactive UI with Material-UI components
- Centralized CORS and security handling via reverse proxy
- MongoDB-backed data persistence across services

## Prerequisites

Ensure the following are installed (already included in devcontainer):

- Node.js v18+
- MongoDB
- npm or yarn
- Python 3.9+
- Java 8
- Gradle  

### Project Setup Instructions

- One fork per group: Before you begin, one member of your group should fork this repository.
- Each group member should clone the forked version of the repository to their local environment or GitHub Codespace.
- All project work should be done in your group's fork.

## Development Setup (GitHub Codespaces)

1. Fork this repo (one per group)
2. Clone your fork locally or open in Codespaces
3. Create a new Codespace from main
4. Open in VS Code for best experience
<img src="screenshots/codespaces.png" width="300"/>

5. Run installation check:
```sh
sh .devcontainer/check-installation.sh
```


## MongoDB Installation & Setup

### For Ubuntu/Debian:
```sh
sudo apt update
sudo apt install -y mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### For Windows:
1. Download MongoDB Community Server
2. Run the installer with default settings
3. Start MongoDB service

### For macOS:
```sh
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

## Running the Application

### Option 1: Docker (Recommended)
```sh
docker-compose up --build
```

### Option 2: Local Development
```sh
# Terminal 1 - Start MongoDB (if not running as service)
mongod

# Terminal 2 - Activity Tracking Service
cd activity-tracking
npm install
npm start

# Terminal 3 - Analytics Service  
cd analytics
pip install -r requirements.txt
python app.py

# Terminal 4 - Auth Service
cd authservice
./gradlew bootRun

# Terminal 5 - Frontend
cd frontend
npm install
npm start
```

## Access Points

### When running with Docker Compose (Recommended)
- **Frontend**: http://localhost:8081 (Nginx proxy)
- **Services are accessible through the Nginx proxy**

### When running locally in development mode
- **Frontend**: http://localhost:3000
- **Activity Tracking Service**: http://localhost:5300
- **Analytics Service**: http://localhost:5050
- **Auth Service**: http://localhost:8080

## API Documentation (Swagger)

Each service includes interactive Swagger/OpenAPI documentation for easy API exploration and testing:

### When running locally in development mode
- **Activity Tracking Service API Docs**: http://localhost:5300/api-docs
  - Explore all exercise-related endpoints
  - Test CRUD operations for exercises
  - View activity types and MET values

- **Analytics Service API Docs**: http://localhost:5050/apidocs
  - Explore statistics and analytics endpoints
  - Test daily, weekly, and overall stats queries
  - View calorie calculations and aggregations

- **Auth Service API Docs**: http://localhost:8080/swagger-ui/index.html
  - Explore authentication and user management endpoints
  - Test signup, login, and password reset flows
  - View user profile operations

### Features of Swagger UI
The Swagger UI provides:
- Interactive API testing directly from the browser
- Detailed request/response schemas
- Example payloads for each endpoint
- Real-time API exploration without external tools

## Testing

### Unit Tests
```sh
cd frontend
npm test
```

### E2E Tests
```sh
cd activity-tracking/cypress
npm install
npx cypress run
```

## Troubleshooting

### Common Docker Issues
```sh
# Clear Docker cache
docker system prune -a

# Rebuild without cache
docker-compose build --no-cache

# View service logs
docker-compose logs [service-name]
```

### MongoDB Issues
- Ensure MongoDB is running on port 27017
- Check database connection strings in config files

### Port Conflicts
- Frontend: Change port in package.json
- Backend: Update docker-compose.yml port mappings

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Description'`
4. Push branch: `git push origin feature-name`
5. Submit Pull Request
