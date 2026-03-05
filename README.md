**Shakti 360 — MLA Fitness App**

A full-stack fitness tracking web application built with a microservices architecture. Track workouts, monitor nutrition, set goals, and visualise your progress — all in one place.

**Group 6 — Team Members:**
Haritha Nallimilli
Sagarika Bohidar
Ramya V
Pon Divya Ravichandran
Manjistha Mukherjee
Sandhya Salian

**Architecture:**
The app is built as a set of independent microservices, all routed through an Nginx reverse proxy:
Browser
  └── Nginx (Port 8081) ── reverse proxy
        ├── /             → React Frontend
        ├── /api/         → Activity Tracking Service (Node.js :5000)
        ├── /analytics/   → Analytics Service (Python Flask :5050)
        ├── /auth/        → Auth Service (Java Spring Boot :8080)
        ├── /nutrition/   → Nutrition API (Node.js :5005)
        └── /workout/     → Workout API (Node.js :5002)

**Tech Stack:**
Layer Technology
Frontend React, Material UI, Recharts
Reverse Proxy Nginx
Activity Tracking Node.js + Express
Analytics Python Flask
Auth Service Java Spring Boot + Gradle
Nutrition API Node.js + Express + Anthropic AI
Workout API Node.js + Express
Database MongoDB Atlas 
Monitoring Prometheus + Grafana        

**Features**

1)Authentication

User registration and login via Java Auth Service
Password reset via email
Session management with localStorage

2)Activity Tracking

Log exercises with type, duration, and intensity
Real-time calorie burn calculation
Weekly activity progress chart
Workout streak tracking

3)Food & Hydration

AI-powered calorie estimation — type any food and get instant calories + macros (protein, carbs, fat) using Claude AI
Portion size tracking with multiple units (g, ml, oz, cup, piece, etc.)
Meal type grouping (Breakfast, Lunch, Dinner, Snack)
Water intake tracking with visual glass indicator
Quick water log buttons (+150ml, +250ml, +500ml, etc.)
Daily calorie and hydration progress bars
AI meal suggestions based on remaining calories, exercise burned, and what you've already eaten — includes Indian and international options
Browse past days' logs
Macro breakdown (protein/carbs/fat chips)

4)Overview Dashboard

Today's calories burned, active minutes, workouts, and streak
Full nutrition summary with macros and hydration
Weekly activity progress graph

5)Goals

Set daily calorie and water goals
Track progress towards fitness goals

6)Workout Plan

Browse and follow structured workout plans

7)Progress

Weekly activity line chart
Total minutes, active days, and average per day

8)Monitoring

Prometheus metrics collection
Grafana dashboards for service health

Environment Variables:
MONGO_URI : nutrition-api, activity-tracking MongoDB connection string
ANTHROPIC_API_KEY : nutrition-api, API key for AI calorie features
