from fastapi import FastAPI, HTTPException, Query, Path
from typing import List
from bson import ObjectId
from pydantic import BaseModel
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime

load_dotenv()

app = FastAPI(title="Group Feed & Leaderboard API")

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
    relatedId: str = None
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
    # Convert to ObjectId if possible
    try:
        group_obj_id = ObjectId(group_id)
    except:
        group_obj_id = group_id

    cursor = db.group_feed.find({"groupId": group_obj_id}).sort("createdAt", -1).limit(limit)
    feed = []
    async for event in cursor:
        feed.append({
            "feed_id": event.get("feed_id"),
            "userId": event.get("userId"),
            "type": event.get("type"),
            "title": event.get("title"),
            "description": event.get("description"),
            "relatedId": event.get("relatedId"),
            "createdAt": event.get("createdAt")
        })
    return feed

# ===================== Group Leaderboard Endpoint =====================
@app.get("/groups/{group_id}/leaderboard", response_model=List[LeaderboardItem])
async def get_group_leaderboard(
    group_id: str = Path(..., description="ID of the group"),
    metric: str = Query("totalMinutes", regex="^(totalMinutes|totalCalories)$"),
    top_n: int = Query(10, gt=0, le=50)
):
    # Convert to ObjectId if possible
    try:
        group_obj_id = ObjectId(group_id)
    except:
        group_obj_id = group_id

    cursor = db.group_challenge_progress.find({"groupId": group_obj_id}).sort(metric, -1).limit(top_n)
    leaderboard = []
    async for rank, record in enumerate(cursor, start=1):
        leaderboard.append({
            "rank": rank,
            "userId": record.get("userId"),
            "totalMinutes": record.get("totalMinutes", 0),
            "totalCalories": record.get("totalCalories", 0),
            "completed": record.get("completed", False)
        })
    return leaderboard