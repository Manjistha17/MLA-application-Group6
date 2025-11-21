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

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}},
     methods="GET,HEAD,POST,OPTIONS,PUT,PATCH,DELETE")

load_dotenv()
mongo_uri = os.getenv('MONGO_URI')
mongo_db = os.getenv('MONGO_DB')

client = MongoClient(mongo_uri)
db = client[mongo_db]


@app.route('/')
def index():
    exercises = db.exercises.find()
    exercises_list = list(exercises)
    return json_util.dumps(exercises_list)


@app.route('/stats')
def stats():
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
    username = request.args.get('user')

    now = datetime.utcnow()
    start_of_day = datetime(now.year, now.month, now.day)
    end_of_day = start_of_day + timedelta(days=1)

    WEIGHT = 66  # default weight in kg

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

    DEFAULT_MET = 1.0
    DEFAULT_CALORIES_EXPR = {
        "$multiply": [
            DEFAULT_MET,
            WEIGHT,
            {"$divide": ["$duration", 60]}
        ]
    }

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
                        "default": DEFAULT_CALORIES_EXPR
                    }
                }
            }
        },
        {
            "$group": {
                "_id": {"exerciseType": "$exerciseType",
                        "subActivity": "$subActivity"
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
                "totalCalories": 1,
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