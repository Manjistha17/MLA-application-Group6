from fastapi import FastAPI, HTTPException, Query, Path
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional
from bson import ObjectId
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = FastAPI(title="Group Feed & Leaderboard API")

origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===================== MongoDB Setup =====================
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB = os.getenv("MONGO_DB")
client = AsyncIOMotorClient(MONGO_URI)
db = client[MONGO_DB]

# ===================== Response Models =====================
class GroupFeedItem(BaseModel):
    feed_id: str
    userId: str
    type: str  # EXERCISE_LOG or AWARDED_BADGE
    title: str
    description: str
    relatedId: Optional[str] = None
    createdAt: datetime

class LeaderboardItem(BaseModel):
    rank: int
    userId: str
    totalMinutes: int = 0
    totalCalories: int = 0
    completed: bool = False

# ===================== Group Feed Endpoint =====================
@app.get("/groups/{group_id}/feed", response_model=List[GroupFeedItem])
async def get_group_feed(
    group_id: str = Path(..., description="ID of the group"),
    limit: int = Query(50, gt=0, le=200, description="Number of feed items to return")
):
    try:
        # Determine if group_id is ObjectId or string
        try:
            group_obj_id = ObjectId(group_id)
        except:
            group_obj_id = group_id

        cursor = db.group_feed.find({"groupId": group_obj_id}).sort("createdAt", -1).limit(limit)
        feed = []

        async for event in cursor:
            # Handle MongoDB $date format
            created_at = event.get("createdAt")
            if isinstance(created_at, dict) and "$date" in created_at:
                created_at = datetime.fromisoformat(created_at["$date"].replace("Z", "+00:00"))
            elif not isinstance(created_at, datetime):
                created_at = datetime.utcnow()

            feed.append({
                "feed_id": event.get("feed_id", "missing_id"),
                "userId": event.get("userId", "unknown"),
                "type": event.get("type", "unknown"),
                "title": event.get("title", "No title"),
                "description": event.get("description", ""),
                "relatedId": event.get("relatedId"),
                "createdAt": created_at
            })

        return feed

    except Exception as e:
        import traceback
        print("ERROR fetching group feed:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")


# ===================== Group Leaderboard Endpoint =====================
@app.get("/groups/{group_id}/leaderboard", response_model=List[LeaderboardItem])
async def get_group_leaderboard(
    group_id: str = Path(..., description="ID of the group"),
    metric: str = Query("totalMinutes", regex="^(totalMinutes|totalCalories)$"),
    top_n: int = Query(10, gt=0, le=50)
):
    try:
        try:
            group_obj_id = ObjectId(group_id)
        except:
            group_obj_id = group_id

        cursor = db.group_challenge_progress.find({"groupId": group_obj_id}).sort(metric, -1).limit(top_n)
        leaderboard = []

        rank = 1
        async for record in cursor:
         leaderboard.append({
         "rank": rank,
         "userId": record.get("userId", "unknown"),
         "totalMinutes": record.get("totalMinutes", 0),
         "totalCalories": record.get("totalCalories", 0),
         "completed": record.get("completed", False)
         })
         rank += 1

        return leaderboard

    except Exception as e:
        import traceback
        print("ERROR fetching leaderboard:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")