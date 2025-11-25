# 🧭 Web Application Architecture Overview

This repository documents the reference architecture for a full-stack web application that integrates multiple services across frontend, backend, and data layers. It emphasizes modularity, security, and scalability.

![Screenshot](screenshots/frontpage.png?v=2)

## 📐 System Architecture

The system is composed of the following layers:

### 1. User Interaction
- **User Interface**: React-based Single Page Application (SPA)
- **Access Point**: Served via Nginx reverse proxy

### 2. Reverse Proxy Layer
- **Nginx**: Handles routing, CORS, and SPA serving
- **Security Layer**: Manages authentication and authorization
- **Frontend Layer**: React SPA with routing and service calls
- **Service Layer**: Node.js, Python, and Java microservices
- **Database Layer**: MongoDB for persistent storage

## 🔐 Security & CORS

- **Authentication**: Credential Service (Java + Gradle) on port `8080`
- **Authorization**: Token-based validation
- **CORS Handling**:
  - Browser sends OPTIONS preflight request
  - Backend must return correct CORS headers
  - Requests without proper headers are blocked

## 🧩 Microservices

| Service                | Technology     | Port  | Purpose                            |
|------------------------|----------------|-------|------------------------------------|
| Activity Tracking      | Node.js        | 5300  | Updates user activity              |
| Analytics              | Python         | 5050  | Fetches and analyzes activity data |
| Credential Validation  | Java + Gradle  | 8080  | Authenticates user credentials     |
| Frontend (Nginx)       | React + Nginx  | 8081  | Serves SPA and handles routing     |

## 🗃️ Database

- **MongoDB**: Stores activity logs and credential data
- **Schema**: Designed for scalability and fast querying  

### Project Setup Instructions

- One fork per group: Before you begin, one member of your group should fork this repository.
- Each group member should clone the forked version of the repository to their local environment or GitHub Codespace.
- All project work should be done in your group's fork.

## 🚀 Setup Instructions

### Prerequisites
- Node.js
- Python 3.x
- Java (with Gradle)
- MongoDB
- Nginx

### Installation
```bash
# Clone the repository
git clone https://github.com/Manjistha17/MLA-application-Group6.git
cd MLA-application-Group6

# Install Node.js dependencies
cd activity-tracking
npm install

# Install Python dependencies
cd ../analytics
pip install -r requirements.txt

# Build Java service
cd ../authservice
./gradlew clean build

# Install Frontend dependencies
cd ../frontend
npm install
```

## ✨ Current Features

- **User Registration**: Personalized tracking with secure authentication
- **Dual Exercise Logging**: 
  - 🏃 **Timer Mode**: Real-time activity tracking with interactive timer
  - ✏️ **Manual Log**: Enter past activities with custom duration
- **Exercise Variety**: Running, Cycling, Swimming, Gym, Yoga, and Other activities
- **Analytics Dashboard**: Weekly and overall statistics with data visualization
- **Interactive UI**: Material-UI components with responsive design
- **Real-time Persistence**: MongoDB integration with instant data updates
- **Comprehensive Testing**: TDD implementation with Jest and React Testing Library

## Development in Github Codespaces

#### Starting a new Devcontainer

1. Click on "Code"
2. Switch to the "Codespaces" tab
3. Create new Codespace from main
<img src="screenshots/codespaces.png" width="300"/>


4. Open Codespace in VS code for best experience:
<img src="screenshots/codespaces2.png" width="300"/>


Walktrough:

https://docs.github.com/en/codespaces/developing-in-a-codespace/using-github-codespaces-in-visual-studio-code


#### Check needed packages are installed:
```sh
sh .devcontainer/check-installation.sh 
```

expected output:

```
Checking installations...
node is /usr/local/bin/node
node is installed with version: v18.16.0
npm is /usr/local/bin/npm
npm is installed with version: 9.5.1
python3 is /usr/bin/python3
python3 is installed with version: Python 3.9.2
pip3 is /usr/bin/pip3
pip3 is installed with version: pip 20.3.4 from /usr/lib/python3/dist-packages/pip (python 3.9)
gradle is /usr/bin/gradle
gradle is installed with version: 
------------------------------------------------------------
Gradle 4.4.1
------------------------------------------------------------
......
Done checking installations.
```

if you're missing any version, please contact your course administrator. 


## 🐳 Docker Deployment

### Quick Start (Recommended)
```bash
# Build and start all services
docker-compose up --build

# Access the application at http://localhost:8081
```

### Docker Commands
```bash
# Start existing containers (no rebuild)
docker-compose up

# Build and start specific service
docker-compose up --build [servicename]

# Stop all services
docker-compose down

# View running containers
docker-compose ps
```


## 🛠️ Development Mode (without Docker)

### Start Individual Services

#### 1. Database
```bash
docker run --name mongodb -d -p 27017:27017 -v mongodbdata:/data/db mongo:latest
```

#### 2. Backend Services
```bash
# Activity Tracking Service (Node.js)
cd activity-tracking
npm install
npm start
# Runs on http://localhost:5300

# Analytics Service (Python/Flask)
cd analytics
pip install -r requirements.txt
flask run -h localhost -p 5050
# Runs on http://localhost:5050

# Authentication Service (Java/Spring Boot)
cd authservice
./gradlew clean build
./gradlew bootRun
# Runs on http://localhost:8080
```

#### 3. Frontend
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

## 🗄️ Database Operations

### Connect to MongoDB
```bash
mongosh -u root -p cfgmla23 --authenticationDatabase admin --host localhost --port 27017
```

### Query Data
```javascript
// Show registered activities
db.exercises.find()

// Show registered users
db.users.find()

// Show activity statistics
db.exercises.aggregate([
  { $group: { _id: "$exerciseType", count: { $sum: 1 } } }
])
```

## 🧪 Testing

### Run Frontend Tests
```bash
cd frontend
npm test
```

### Run Java Tests
```bash
cd authservice
./gradlew test
```

### Test Coverage
- **Frontend**: Jest + React Testing Library
- **Backend**: JUnit for Java services
- **Integration**: End-to-end testing with Cypress

## 🚀 Deployment

The application is containerized using Docker and can be deployed on any platform that supports Docker containers:

- **Development**: Local Docker Compose setup
- **Production**: Kubernetes or cloud container services
- **CI/CD**: GitHub Actions pipeline for automated testing and deployment

## 📁 Project Structure

```
MLA-application-Group6/
├── frontend/              # React SPA
├── activity-tracking/     # Node.js microservice
├── analytics/            # Python Flask service
├── authservice/          # Java Spring Boot service
├── mongo-init/           # Database initialization
├── docker-compose.yml    # Container orchestration
└── README.md            # This file
```
