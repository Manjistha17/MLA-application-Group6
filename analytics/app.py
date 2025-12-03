from dotenv import load_dotenv
from flask import Flask, render_template, jsonify, request
from pymongo import MongoClient
from flask_pymongo import PyMongo
from flask_cors import CORS
from urllib.parse import quote_plus
from bson import json_util
import traceback
import logging
import os
from datetime import datetime, timedelta
from flasgger import Swagger

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}},
     methods="GET,HEAD,POST,OPTIONS,PUT,PATCH,DELETE")

# Swagger configuration
swagger_config = {
    "headers": [],
    "specs": [
        {
            "endpoint": "apispec",
            "route": "/apispec.json",
            "rule_filter": lambda rule: True,
            "model_filter": lambda tag: True,
        }
    ],
    "static_url_path": "/flasgger_static",
    "swagger_ui": True,
    "specs_route": "/api-docs/"
}

swagger_template = {
    "info": {
        "title": "Analytics Service API",
        "description": "API documentation for the Analytics Service. This service provides statistics and analytics for exercise data including daily, weekly, and overall activity metrics.",
        "version": "1.0.0",
        "contact": {
            "name": "MLA Fitness App Team"
        }
    },
    "servers": [
        {
            "url": "http://localhost:5050",
            "description": "Development server"
        }
    ]
}

swagger = Swagger(app, config=swagger_config, template=swagger_template)

# 1. Always have at least one handler
if not app.logger.handlers:
    handler = logging.StreamHandler()
    handler.setLevel(logging.INFO)
    app.logger.addHandler(handler)

# 2. Attach Gunicorn's logger if running under Gunicorn
gunicorn_error_logger = logging.getLogger('gunicorn.error')
if gunicorn_error_logger.handlers:
    app.logger.handlers = gunicorn_error_logger.handlers

# 3. Set level
app.logger.setLevel(logging.INFO)


load_dotenv()
mongo_uri = os.getenv('MONGO_URI')
mongo_db = os.getenv('MONGO_DB')

client = MongoClient(mongo_uri)
db = client[mongo_db]

def get_user_weight(username, default_weight=66):
    app.logger.info(f"DEBUG → get_user_weight() called with username: {repr(username)}")

    """
    Fetch weight for a given username from the users collection.
    Returns default_weight if user or weight field not found.
    """
    user = db.users.find_one({"username": username}, {"weight": 1, "_id": 0})
    if user and "weight" in user:
        return user["weight"]
    return default_weight


@app.route('/')
def index():
    """Get all exercises
    ---
    tags:
      - Exercises
    responses:
      200:
        description: List of all exercises
        content:
          application/json:
            schema:
              type: array
              items:
                type: object
                properties:
                  _id:
                    type: string
                  username:
                    type: string
                  exerciseType:
                    type: string
                  duration:
                    type: number
                  date:
                    type: string
                    format: date-time
    """
    exercises = db.exercises.find()
    exercises_list = list(exercises)
    return json_util.dumps(exercises_list)


@app.route('/stats')
def stats():
    """Get overall exercise statistics
    ---
    tags:
      - Statistics
    responses:
      200:
        description: Statistics grouped by username and exercise type
        content:
          application/json:
            schema:
              type: object
              properties:
                stats:
                  type: array
                  items:
                    type: object
                    properties:
                      username:
                        type: string
                      exercises:
                        type: array
                        items:
                          type: object
                          properties:
                            exerciseType:
                              type: string
                            totalDuration:
                              type: number
    """
    pipeline = [
        {
            "$group": {
                "_id": {
                    "username": "$username",
                    "exerciseType": "$exerciseType"
                },
                "totalDuration": {"$sum": "$duration"}
            }
        },
        {
            "$group": {
                "_id": "$_id.username",
                "exercises": {
                    "$push": {
                        "exerciseType": "$_id.exerciseType",
                        "totalDuration": "$totalDuration"
                    }
                }
            }
        },
        {
            "$project": {
                "username": "$_id",
                "exercises": 1,
                "_id": 0
            }
        }
    ]

    stats = list(db.exercises.aggregate(pipeline))
    return jsonify(stats=stats)


@app.route('/stats/<username>', methods=['GET'])
def user_stats(username):
    """Get statistics for a specific user
    ---
    tags:
      - Statistics
    parameters:
      - name: username
        in: path
        type: string
        required: true
        description: Username to get statistics for
    responses:
      200:
        description: User statistics by exercise type
        content:
          application/json:
            schema:
              type: object
              properties:
                stats:
                  type: array
                  items:
                    type: object
                    properties:
                      username:
                        type: string
                      exercises:
                        type: array
                        items:
                          type: object
                          properties:
                            exerciseType:
                              type: string
                            totalDuration:
                              type: number
    """
    pipeline = [
        {
            "$match": {"username": username}
        },
        {
            "$group": {
                "_id": {
                    "username": "$username",
                    "exerciseType": "$exerciseType"
                },
                "totalDuration": {"$sum": "$duration"}
            }
        },
        {
            "$group": {
                "_id": "$_id.username",
                "exercises": {
                    "$push": {
                        "exerciseType": "$_id.exerciseType",
                        "totalDuration": "$totalDuration"
                    }
                }
            }
        },
        {
            "$project": {
                "username": "$_id",
                "exercises": 1,
                "_id": 0
            }
        }
    ]

    stats = list(db.exercises.aggregate(pipeline))
    return jsonify(stats=stats)


@app.route('/stats/weekly/', methods=['GET'])
def weekly_user_stats():
    """Get weekly statistics for a user
    ---
    tags:
      - Statistics
    parameters:
      - name: user
        in: query
        type: string
        required: true
        description: Username
      - name: start
        in: query
        type: string
        required: true
        description: Start date (YYYY-MM-DD format)
      - name: end
        in: query
        type: string
        required: true
        description: End date (YYYY-MM-DD format)
    responses:
      200:
        description: Weekly statistics for the user
        content:
          application/json:
            schema:
              type: object
              properties:
                stats:
                  type: array
                  items:
                    type: object
                    properties:
                      exerciseType:
                        type: string
                      totalDuration:
                        type: number
      400:
        description: Invalid date format
    """
    username = request.args.get('user')
    start_date_str = request.args.get('start')
    end_date_str = request.args.get('end')

    date_format = "%Y-%m-%d"
    try:
        start_date = datetime.strptime(start_date_str, date_format)
        end_date = datetime.strptime(end_date_str, date_format) + timedelta(days=1)  # Include the whole end day

        logging.info(f"Fetching weekly stats for user: {username} from {start_date} to {end_date}")
    except Exception as e:
        logging.error(f"Error parsing dates: {e}")
        return jsonify(error="Invalid date format"), 400

    pipeline = [
        {
            "$match": {
                "username": username,
                "date": {
                    "$gte": start_date,
                    "$lt": end_date
                }
            }
        },
        {
            "$group": {
                "_id": {
                    "exerciseType": "$exerciseType"
                },
                "totalDuration": {"$sum": "$duration"}
            }
        },
        {
            "$project": {
                "exerciseType": "$_id.exerciseType",
                "totalDuration": 1,
                "_id": 0
            }
        }
    ]

    try:
        stats = list(db.exercises.aggregate(pipeline))
        return jsonify(stats=stats)
    except Exception as e:
        current_app.logger.error(f"An error occurred while querying MongoDB: {e}")
        traceback.print_exc()
        return jsonify(error="An internal error occurred"), 500

@app.route('/stats/daily/', methods=['GET'])
def get_daily_stats():
    """Get daily statistics for a user
    ---
    tags:
      - Statistics
    parameters:
      - name: user
        in: query
        type: string
        required: true
        description: Username to get daily statistics for
    responses:
      200:
        description: Daily statistics including calories burned
        content:
          application/json:
            schema:
              type: object
              properties:
                stats:
                  type: array
                  items:
                    type: object
                    properties:
                      exerciseType:
                        type: string
                      subActivity:
                        type: string
                      totalDuration:
                        type: number
                      totalCalories:
                        type: number
                        nullable: true
                      count:
                        type: integer
      500:
        description: Internal server error
    """
    app.logger.info(f"FULL URL HIT ⇒ {request.url}")
    username = request.args.get('user')
    app.logger.info(f"USERNAME RECEIVED ⇒ {repr(username)}")
    app.logger.info(f"DEBUG → har called with username: {repr(username)}")

    now = datetime.utcnow()
    start_of_day = datetime(now.year, now.month, now.day)
    end_of_day = start_of_day + timedelta(days=1)

    # WEIGHT = 66  # default weight in kg

    # Get dynamic weight from users collection
    WEIGHT = get_user_weight(username, default_weight=66)

    # --- Fetch MET values from new collection ---
    met_docs = db.activity_mets_new.find({})
    met_rates = {}

    for doc in met_docs:
        activity = doc.get('activity')
        for sub in doc.get('sub_activity_options', []):
            met_rates[(activity, sub['name'])] = sub['met']

    # --- Build $switch for calorie computation ---
    branches = []
    for (activity, subActivity), met in met_rates.items():
        if subActivity:  # If subActivity exists in METs
            branches.append({
                "case": {
                    "$and": [
                        {"$eq": ["$exerciseType", activity]},
                        {"$eq": ["$subActivity", subActivity]}
                    ]
                },
                "then": {
                    "$multiply": [
                        met,
                        WEIGHT,
                        {"$divide": ["$duration", 60]}
                    ]
                }
            })
        else:  # If subActivity is None or missing
            branches.append({
                "case": {"$eq": ["$exerciseType", activity]},
                "then": {
                    "$multiply": [
                        met,
                        WEIGHT,
                        {"$divide": ["$duration", 60]}
                    ]
                }
            })

    # --- Build aggregation ---
    match_stage = {"date": {"$gte": start_of_day, "$lt": end_of_day}}
    if username:
        match_stage["username"] = username

    pipeline = [
        {"$match": match_stage},
        {
            "$addFields": {
                "calories": {
                    "$switch": {
                        "branches": branches,
                        "default": 0
                    }
                }
            }
        },
        {
            "$group": {
                "_id": {
                    "exerciseType": "$exerciseType",
                    "subActivity": {"$ifNull": ["$subActivity", None]}
                },
                "totalDuration": {"$sum": "$duration"},
                "totalCalories": {"$sum": "$calories"},
                "count": {"$sum": 1}
            }
        },
        {
            "$project": {
                "_id": 0,
                "exerciseType": "$_id.exerciseType",
                "subActivity": "$_id.subActivity",
                "totalDuration": 1,
                "totalCalories": {
                    "$cond": [
                        {"$eq": ["$totalCalories", 0]},
                        None,
                        "$totalCalories"
                    ]
                },
                "count": 1
            }
        }
    ]

    try:
        stats = list(db.exercises.aggregate(pipeline))
        return jsonify(stats=stats), 200
    except Exception as e:
        app.logger.error(f"Error fetching daily stats: {e}")
        return jsonify(error="Internal server error"), 500
    
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5050)