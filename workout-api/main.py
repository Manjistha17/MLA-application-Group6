from fastapi import FastAPI, HTTPException, Query, Request
from pydantic import BaseModel, Field
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional
from dotenv import load_dotenv
from datetime import datetime, timedelta, date
import os
from prometheus_client import Counter, Histogram, REGISTRY
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
import time
from fastapi.middleware.cors import CORSMiddleware
from openai import AsyncOpenAI
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

load_dotenv()

app = FastAPI(title="Fitness App API")

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
# ============================================================
# OpenAI client setup
# ============================================================
openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ============================================================
# AI Coach endpoint
# ============================================================
@app.get("/coach/daily-tip")
async def get_daily_tip(
    request: Request,
    username: str = Query(...),
    calorie_goal: int = Query(2000),
    water_goal: int = Query(2500),
):
    today = str(date.today())

    # ── Per-user daily rate limit (100 requests/day) via MongoDB ──
    rate_key = f"{username}:{today}"
    rate_doc = await db.coach_rate_limits.find_one({"key": rate_key})
    if rate_doc and rate_doc.get("count", 0) >= 100:
        raise HTTPException(
            status_code=429,
            detail="Daily tip limit reached (100/day). Try again tomorrow.",
        )
    await db.coach_rate_limits.update_one(
        {"key": rate_key},
        {
            "$inc": {"count": 1},
            "$setOnInsert": {
                "expires_at": datetime.utcnow() + timedelta(days=2)
            },
        },
        upsert=True,
    )

    # ── Return cached tip if one already exists for today ──
    cached = await db.coach_tips.find_one({"username": username, "date": today})
    if cached:
        return {"message": cached["message"]}

    # ── Fetch user profile ──
    user = await db.users.find_one({"username": username})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # ── Fetch today's nutrition — sum ALL docs for today (each log is a separate doc) ──
    nutrition_docs = await db.nutritions.find(
        {"userId": username, "date": today}
    ).to_list(length=200)
    calories_consumed = sum(doc.get("calories", 0) for doc in nutrition_docs)
    water_intake      = sum(doc.get("water", 0)    for doc in nutrition_docs)

    # ── Fetch today's exercises — matched by datetime object range ──
    start_dt = datetime.combine(date.today(), datetime.min.time())
    end_dt   = datetime.combine(date.today(), datetime.max.time())
    exercises_today = await db.exercises.find({
        "username": username,
        "date": {"$gte": start_dt, "$lte": end_dt}
    }).to_list(length=100)

    # ── Fetch user's active workout plan ──
    plan = await db.user_workout_plans.find_one({"user_id": username})

    # ── User profile fields ──
    age       = user.get("age", "unknown")
    weight    = user.get("weight", "unknown")
    height    = user.get("height", "unknown")
    gender    = user.get("gender", "unknown")
    goal_type = plan.get("goal_type", "General Fitness") if plan else "General Fitness"
    level     = plan.get("level", "Beginner")            if plan else "Beginner"

    # ── Derived nutrition values ──
    calories_remaining = max(0, calorie_goal - calories_consumed)
    water_remaining    = max(0, water_goal   - water_intake)

    # ── Exercise fields ──
    total_exercise_minutes = sum(e.get("duration", 0) for e in exercises_today)
    exercise_count         = len(exercises_today)
    exercise_types         = (
        ", ".join([e.get("exerciseType", "") for e in exercises_today])
        if exercises_today else "none"
    )

    prompt = f"""
You are a knowledgeable, direct fitness coach. Give ONE specific, actionable recommendation.

User profile:
- Age: {age}, Gender: {gender}, Weight: {weight}kg, Height: {height}cm
- Goal: {goal_type}, Fitness level: {level}

Today's data:
- Exercises done: {exercise_count} ({exercise_types})
- Total exercise minutes: {total_exercise_minutes}
- Calories consumed: {calories_consumed} / {calorie_goal} kcal ({calories_remaining} kcal remaining)
- Water intake: {water_intake} / {water_goal} ml ({water_remaining} ml remaining)

Rules:
- Do NOT just motivate — give a specific action the user should take RIGHT NOW based on their numbers
- If calories remaining > 800, suggest a specific meal or snack with approximate calories
- If water remaining > 500ml, tell them exactly how many glasses they still need
- If exercise minutes < 30, suggest a specific workout type suited to their goal and level
- Always acknowledge what exercises were completed today if exercise_count > 0
- If everything looks good, suggest one recovery or optimization tip (sleep, stretching, protein timing etc.)
- Be conversational but concrete. Maximum 3 sentences. No generic phrases like "keep it up" or "you got this".
"""

    response = await openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
    )
    message = response.choices[0].message.content

    # ── Cache the tip for today ──
    await db.coach_tips.delete_many({"username": username, "date": today})
    await db.coach_tips.insert_one(
        {"username": username, "date": today, "message": message}
    )

    return {"message": message}


# ============================================================
# Invalidate coach tip cache endpoint
# ============================================================
@app.delete("/coach/daily-tip/invalidate")
async def invalidate_coach_tip(username: str = Query(...)):
    today = str(date.today())
    await db.coach_tips.delete_many({"username": username, "date": today})
    return {"message": "Cache invalidated"}