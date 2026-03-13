from fastapi import Body
from fastapi import FastAPI, HTTPException, Query, Path, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime
from uuid import uuid4

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

# class PublicGroupItem(BaseModel):
#     groupId: str
#     groupName: str
#     description: Optional[str] = None

# @app.get("/groups/public", response_model=List[PublicGroupItem])
# async def get_public_groups():
#     """
#     Returns a list of all public groups (visibility == "PUBLIC").
#     """
#     try:
#         groups = []
#         cursor = db.groups.find({"visibility": "PUBLIC"})  # <- corrected field
#         async for group in cursor:
#             groups.append({
#                 "groupId": group.get("groupId"),
#                 "groupName": group.get("name", "Unknown"),
#                 "description": group.get("description", "")
#             })
#         return groups
#     except Exception as e:
#         import traceback
#         print("ERROR fetching public groups:", e)
#         traceback.print_exc()
#         raise HTTPException(status_code=500, detail="Internal Server Error")

# ---------------- Response Model ----------------
class PublicGroupItem(BaseModel):
    groupId: str
    groupName: str
    description: str

# ---------------- Public Groups Endpoint ----------------
@app.get("/groups/public", response_model=List[PublicGroupItem])
async def get_public_groups(userId: str = Query(..., description="Current user's ID")):
    """
    Returns a list of all public groups (visibility == "PUBLIC") 
    excluding groups where the user is already a member.
    """
    if not userId:
        raise HTTPException(status_code=400, detail="Missing userId")

    try:
        # Get groupIds the user is already a member of
        memberships_cursor = db.group_memberships.find({"userId": userId})
        existing_memberships = await memberships_cursor.to_list(None)
        member_group_ids = [m["groupId"] for m in existing_memberships]

        # Fetch public groups excluding already joined
        groups = []
        cursor = db.groups.find({
            "visibility": "PUBLIC",
            "groupId": {"$nin": member_group_ids}
        })
        async for group in cursor:
            groups.append({
                "groupId": group.get("groupId", ""),
                "groupName": group.get("name", "Unknown"),
                "description": group.get("description", "")
            })
        return groups

    except Exception as e:
        print("ERROR fetching public groups:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")
# ===================== Group Creation Model (Extended) =====================
class GroupRules(BaseModel):
    activityTypes: List[str]
    metric: str
    target: int

class GroupCreateRequest(BaseModel):
    name: str
    type: str
    visibility: str
    status: str
    description: str
    rules: GroupRules
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    createdBy: str
    challengeMode: str

class GroupCreateResponse(BaseModel):
    groupId: str
    name: str
    type: str
    visibility: str
    status: str
    description: str
    rules: Dict[str, Any]
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    createdBy: str
    challengeMode: str

# ===================== Create Group Endpoint (Extended) =====================
@app.post("/groups/create", response_model=GroupCreateResponse)
async def create_group(payload: GroupCreateRequest):
    """
    Create a new group with all challenge parameters and assign the creator as admin and member.
    """
    try:
        group_id = f"g_{uuid4().hex[:10]}"
        group_doc = {
            "groupId": group_id,
            "name": payload.name,
            "type": payload.type,
            "visibility": payload.visibility,
            "status": payload.status,
            "description": payload.description,
            "rules": payload.rules.dict(),
            "startDate": payload.startDate,
            "endDate": payload.endDate,
            "createdBy": payload.createdBy,
            "challengeMode": payload.challengeMode,
            "createdAt": datetime.utcnow(),
            "isPublic": payload.visibility.upper() == "PUBLIC",
            "members": [payload.createdBy],
        }
        await db.groups.insert_one(group_doc)

        # Add creator as member in group_memberships
        await db.group_memberships.insert_one({
            "userId": payload.createdBy,
            "groupId": group_id,
            "role": "admin",
            "joinedAt": datetime.utcnow(),
        })

        return {
            "groupId": group_id,
            "name": payload.name,
            "type": payload.type,
            "visibility": payload.visibility,
            "status": payload.status,
            "description": payload.description,
            "rules": payload.rules.dict(),
            "startDate": payload.startDate,
            "endDate": payload.endDate,
            "createdBy": payload.createdBy,
            "challengeMode": payload.challengeMode,
        }
    except Exception as e:
        import traceback
        print("ERROR creating group:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Failed to create group")

# ================= Response Model =================
class UserGroupName(BaseModel):
    groupId: str
    groupName: str

# ================= Endpoint =================
@app.get("/users/{user_id}/groups", response_model=List[UserGroupName])
async def get_user_groups(user_id: str = Path(..., description="User ID")):
    """
    Returns a list of groups the user belongs to, with group ID and name.
    """
    try:
        groups_list = []

        # 1️⃣ Fetch memberships for the user
        cursor = db.group_memberships.find({"userId": user_id})
        async for membership in cursor:
            group_id = membership.get("groupId")
            
            # 2️⃣ Fetch group details
            group = await db.groups.find_one({"groupId": group_id})
            if group:
                groups_list.append({
                    "groupId": group.get("groupId"),
                    "groupName": group.get("name", "Unknown")
                })

        return groups_list

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")

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

class GroupDetail(BaseModel):
    groupId: str
    name: str
    description: Optional[str] = None
    rules: Optional[dict] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    createdBy: Optional[str] = None
    challengeMode: Optional[str] = None

class MemberItem(BaseModel):
    userId: str
    name: Optional[str] = None

class NotificationItem(BaseModel):
    notificationId: str
    userId: str
    title: str
    message: str
    type: str
    relatedId: Optional[str] = None
    isRead: bool = False
    createdAt: datetime

class GroupProgress(BaseModel):
    totalMinutes: int = 0
    totalCalories: int = 0
    completed: bool = False

# ===================== Get Group Details Endpoint =====================
@app.get("/groups/{group_id}", response_model=GroupDetail)
async def get_group_details(group_id: str = Path(..., description="ID of the group")):
    """
    Returns group details including rules and metric information.
    """
    try:
        # Try to find by groupId string first
        group = await db.groups.find_one({"groupId": group_id})
        
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        return {
            "groupId": group.get("groupId"),
            "name": group.get("name", "Unknown"),
            "description": group.get("description"),
            "rules": group.get("rules", {}),
            "startDate": group.get("startDate"),
            "endDate": group.get("endDate"),
            "createdBy": group.get("createdBy"),
            "challengeMode": group.get("challengeMode")
        }
    
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        print("ERROR fetching group details:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")


# ===================== Group Members Endpoint =====================
@app.get("/groups/{group_id}/members", response_model=List[MemberItem])
async def get_group_members(group_id: str = Path(..., description="ID of the group")):
    """
    Returns the list of members for a group (userId and optional name).
    """
    try:
        try:
            group_obj_id = ObjectId(group_id)
        except:
            group_obj_id = group_id

        members = []
        cursor = db.group_memberships.find({"groupId": group_obj_id})
        async for m in cursor:
            uid = m.get("userId")
            display_name = None
            # try to fetch user name if users collection exists
            user = await db.users.find_one({"userId": uid})
            if user:
                display_name = user.get("name") or user.get("username")
            members.append({"userId": uid, "name": display_name})

        return members
    except Exception as e:
        import traceback
        print("ERROR fetching group members:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")


# ===================== Notifications Endpoint =====================
@app.get("/users/{user_id}/notifications", response_model=List[NotificationItem])
async def get_notifications(user_id: str = Path(..., description="User ID")):
    """
    Returns notifications for the given user, newest first.
    """
    try:
        cursor = db.notifications.find({"userId": user_id}).sort("createdAt", -1)
        notes = []
        async for n in cursor:
            created = n.get("createdAt")
            if isinstance(created, dict) and "$date" in created:
                created = datetime.fromisoformat(created["$date"].replace("Z", "+00:00"))
            notes.append({
                "notificationId": n.get("notificationId"),
                "userId": n.get("userId"),
                "title": n.get("title"),
                "message": n.get("message"),
                "type": n.get("type"),
                "relatedId": n.get("relatedId"),
                "isRead": n.get("isRead", False),
                "createdAt": created or datetime.utcnow()
            })
        return notes
    except Exception as e:
        import traceback
        print("ERROR fetching notifications:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")


class UserItem(BaseModel):
    username: str

@app.get("/users/", response_model=List[UserItem])
async def get_users():
    """
    Returns a list of usernames from the users collection.
    """
    try:
        users_list = []
        cursor = db.users.find({}, {"username": 1, "_id": 0})  # fetch only username
        async for user in cursor:
            users_list.append({"username": user["username"]})
        return users_list
    except Exception as e:
        import traceback
        print("ERROR fetching users:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")
    
# simple helper to mark a notification read/unread
@app.patch("/users/{user_id}/notifications/{notification_id}")
async def update_notification(
    user_id: str = Path(..., description="User ID"),
    notification_id: str = Path(..., description="Notification ID"),
    isRead: bool = Query(None, description="New read status"),
):
    """
    Update read status for a specific notification. Currently only supports toggling `isRead`.
    """
    if isRead is None:
        raise HTTPException(status_code=400, detail="isRead query parameter required")
    try:
        result = await db.notifications.update_one(
            {"userId": user_id, "notificationId": notification_id},
            {"$set": {"isRead": isRead}},
        )
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Notification not found")
        return {"updated": True}
    except Exception as e:
        import traceback
        print("ERROR updating notification:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")

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
            user_id = record.get("userId")
            # skip entries without valid userId
            if not user_id:
                continue
            leaderboard.append({
                "rank": rank,
                "userId": user_id,
                "totalMinutes": record.get("totalMinutes", 0),
                "totalCalories": int(round(record.get("totalCalories", 0))),
                "completed": record.get("completed", False)
            })
            rank += 1

        return leaderboard

    except Exception as e:
        import traceback
        print("ERROR fetching leaderboard:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")


# ===================== Group Progress Endpoint =====================
@app.get("/groups/{group_id}/progress", response_model=GroupProgress)
async def get_group_progress(
    group_id: str = Path(..., description="ID of the group")
):
    """
    Returns aggregate progress record stored with no userId (group level total).
    """
    try:
        try:
            group_obj_id = ObjectId(group_id)
        except:
            group_obj_id = group_id

        # look for entry where userId is null or missing
        query = {"groupId": group_obj_id, "userId": None}
        record = await db.group_challenge_progress.find_one(query)
        if not record:
            # also try missing field
            record = await db.group_challenge_progress.find_one({"groupId": group_obj_id, "userId": {"$exists": False}})

        if not record:
            # return defaults
            return GroupProgress()

        return {
            "totalMinutes": record.get("totalMinutes", 0),
            "totalCalories": int(round(record.get("totalCalories", 0))),
            "completed": record.get("completed", False)
        }
    except Exception as e:
        import traceback
        print("ERROR fetching group progress:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")



class JoinGroupRequest(BaseModel):
    userId: str

@app.post("/groups/{group_id}/join")
async def join_group(
    group_id: str = Path(..., description="ID of the group"),
    req: JoinGroupRequest = Body(...)
):
    """
    Adds the user to group_memberships if not already a member.
    """
    try:
        # Check if group exists
        group = await db.groups.find_one({"groupId": group_id})
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        # Check if user is already a member
        existing = await db.group_memberships.find_one({
            "userId": req.userId,
            "groupId": group_id
        })
        if existing:
            return {"joined": False, "message": "Already a member"}
        
        # Insert membership record
        await db.group_memberships.insert_one({
            "userId": req.userId,
            "groupId": group_id,
            "role": "MEMBER",
            "joinedAt": datetime.utcnow()
        })

        return {"joined": True, "message": "Successfully joined the group"}

    except Exception as e:
        import traceback
        print("ERROR joining group:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Internal Server Error")

# Assume `db` is your MongoDB client already initialized
# Example: db = client[MONGO_DB]

class AddMembersRequest(BaseModel):
    members: List[str] = Field(..., description="List of usernames to add to the group")

@app.post("/groups/{group_id}/add-members")
async def add_members(group_id: str = Path(..., description="ID of the group"),
                      payload: AddMembersRequest = Body(...)):
    """
    Add multiple members to a group_memberships collection.
    Each entry contains: groupId + userId + role + joinedAt
    """
    # Trim usernames and remove empty strings
    usernames = [u.strip() for u in payload.members if u.strip()]
    if not usernames:
        raise HTTPException(status_code=400, detail="No valid usernames provided")

    # 1️⃣ Validate group exists
    group = await db.groups.find_one({"groupId": group_id})
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    # 2️⃣ Fetch users by username
    user_docs = await db.users.find({"username": {"$in": usernames}}).to_list(None)
    if not user_docs:
        raise HTTPException(status_code=400, detail="No valid users found")

    # 3️⃣ Prepare new membership entries
    member_inserts = []
    for user in user_docs:
        user_id = user.get("userId") or user.get("username")
        if not user_id:
            continue  # skip users without userId

        # Check if membership already exists
        exists = await db.group_memberships.find_one({
            "groupId": group_id,
            "userId": user_id
        })
        if not exists:
            member_inserts.append({
                "groupId": group_id,
                "userId": user_id,
                "role": "MEMBER",
                "joinedAt": datetime.utcnow()
            })

    # 4️⃣ Insert new members if any
    if member_inserts:
        await db.group_memberships.insert_many(member_inserts)

    return {
        "updated": True,
        "added_count": len(member_inserts),
        "groupId": group_id,
        "message": f"{len(member_inserts)} member(s) added successfully."
    }