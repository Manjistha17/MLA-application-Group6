from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional
from dotenv import load_dotenv
from datetime import datetime
import os
from prometheus_client import Counter, Histogram, REGISTRY
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
import time

load_dotenv()

app = FastAPI(title="Fitness App API")

# ============================================================
# Prometheus metrics setup
# ============================================================
request_count = Counter('fastapi_requests_total', 'Total requests', ['method', 'endpoint', 'status'])
request_duration = Histogram('fastapi_request_duration_seconds', 'Request duration', ['method', 'endpoint'])

class PrometheusMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        start = time.time()
        response = await call_next(request)
        duration = time.time() - start
        
        request_count.labels(
            method=request.method,
            endpoint=request.url.path,
            status=response.status_code
        ).inc()
        request_duration.labels(
            method=request.method,
            endpoint=request.url.path
        ).observe(duration)
        
        return response

app.add_middleware(PrometheusMiddleware)

# Metrics endpoint
@app.get("/metrics")
async def metrics():
    return Response(generate_latest(REGISTRY), media_type=CONTENT_TYPE_LATEST)

# ============================================================
# MongoDB connection
# ============================================================
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB")

client = AsyncIOMotorClient(MONGO_URI)
db = client[MONGO_DB]

# ============================================================
# Pydantic models (MASTER WORKOUT PLAN)
# ============================================================
class MasterWorkout(BaseModel):
    day_index: int = Field(..., ge=1)
    activity: str
    sub_activity: str
    minutes: int = Field(..., ge=0)

class MasterWorkoutPlanResponse(BaseModel):
    plan_id: str
    goal_type: str
    level: str
    number_of_weeks: int
    total_days: int
    workouts: List[MasterWorkout]

# ============================================================
# Fetch master workout plan
# ============================================================
@app.get("/workout-plan", response_model=MasterWorkoutPlanResponse)
async def get_master_workout_plan(
    goal_type: str = Query(...),
    level: str = Query(...),
    number_of_weeks: int = Query(..., gt=0),
):
    plan = await db.workout_plans.find_one({
        "goal_type": goal_type,
        "level": level,
        "number_of_weeks": number_of_weeks
    })

    if not plan:
        raise HTTPException(status_code=404, detail="Workout plan not found")

    workouts = [
        {
            "day_index": w["day_index"],
            "activity": w["activity"],
            "sub_activity": w["sub_activity"],
            "minutes": w["minutes"]
        }
        for w in plan.get("workouts", [])
    ]

    return {
        "plan_id": str(plan["_id"]),
        "goal_type": plan["goal_type"],
        "level": plan["level"],
        "number_of_weeks": plan["number_of_weeks"],
        "total_days": plan.get("total_days", len(workouts)),
        "workouts": workouts
    }

# ============================================================
# Pydantic models (USER WORKOUT PLAN)
# ============================================================
class UserWorkout(BaseModel):
    exercise_id: str  # Changed from _id to exercise_id
    day_index: int
    activity: str
    sub_activity: str
    minutes: int
    completed: Optional[bool] = False
    completed_at: Optional[datetime] = None

class UserWorkoutPlanCreate(BaseModel):
    user_id: str
    goal_type: str
    level: str
    number_of_weeks: int

class UserWorkoutPlanResponse(BaseModel):
    _id: str  # Mongo ID for the user plan
    user_id: str
    plan_id: str
    goal_type: str
    level: str
    number_of_weeks: int
    total_days: int
    workouts: List[UserWorkout]

# ============================================================
# Create user workout plan
# ============================================================
@app.post("/workouts/create/user-workout-plan", response_model=UserWorkoutPlanResponse)
async def create_user_workout_plan(payload: UserWorkoutPlanCreate):
    # Check if user already has a plan with same goal_type, level, and number_of_weeks
    existing_plan = await db.user_workout_plans.find_one({
        "user_id": payload.user_id,
        "goal_type": payload.goal_type,
        "level": payload.level,
        "number_of_weeks": payload.number_of_weeks
    })

    if existing_plan:
        raise HTTPException(status_code=409, detail="A workout plan with these settings already exists for this user")

    master_plan = await db.workout_plans.find_one({
        "goal_type": payload.goal_type,
        "level": payload.level,
        "number_of_weeks": payload.number_of_weeks
    })

    if not master_plan:
        raise HTTPException(status_code=404, detail="Master workout plan not found")

    workouts = []
    for i, w in enumerate(master_plan.get("workouts", [])):
        workouts.append({
            "exercise_id": f"ex_{i+1:03}",  # directly use exercise_id
            "day_index": w["day_index"],
            "activity": w["activity"],
            "sub_activity": w["sub_activity"],
            "minutes": w["minutes"],
            "completed": False,
            "completed_at": None
        })

    user_plan_doc = {
        "user_id": payload.user_id,
        "plan_id": str(master_plan["_id"]),
        "goal_type": master_plan["goal_type"],
        "level": master_plan["level"],
        "number_of_weeks": master_plan["number_of_weeks"],
        "total_days": master_plan.get("total_days", len(workouts)),
        "workouts": workouts
    }

    result = await db.user_workout_plans.insert_one(user_plan_doc)
    return {**user_plan_doc, "_id": str(result.inserted_id)}

# ============================================================
# Fetch all user workout plans
# ============================================================
@app.get("/workouts/user-workout-plan/all", response_model=List[UserWorkoutPlanResponse])
async def get_all_user_workout_plans(user_id: str = Query(...)):
    cursor = db.user_workout_plans.find({"user_id": user_id})
    plans = []

    async for plan in cursor:
        plan["_id"] = str(plan["_id"])
        plans.append(plan)

    return plans

# ============================================================
# Mark exercise as completed
# ============================================================
class MarkExerciseComplete(BaseModel):
    username: str
    plan_id: str
    exercise_id: str
    day_index: int
    exerciseType: str
    subActivity: Optional[str] = ""
    description: Optional[str] = ""
    duration: int

@app.post("/workouts/exercises/mark-complete")
async def mark_exercise_complete(payload: MarkExerciseComplete):
    now = datetime.utcnow()

    # Log exercise in exercises collection
    await db.exercises.insert_one({
        "username": payload.username,
        "exerciseType": payload.exerciseType,
        "subActivity": payload.subActivity or "",
        "description": payload.description or "",
        "duration": payload.duration,
        "date": now
    })

    # Update user workout plan exercise completion
    result = await db.user_workout_plans.update_one(
        {
            "user_id": payload.username,
            "plan_id": payload.plan_id,
            "workouts": {
                "$elemMatch": {
                    "exercise_id": payload.exercise_id,
                    "day_index": payload.day_index
                }
            }
        },
        {
            "$set": {
                "workouts.$.completed": True,
                "workouts.$.completed_at": now
            }
        }
    )

    if result.matched_count == 0:
        raise HTTPException(
            status_code=404,
            detail="Exercise not found"
        )

    return {
        "message": "Workout marked as completed",
        "exercise_id": payload.exercise_id,
        "completed_at": now
    }
