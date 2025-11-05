from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.getenv('MONGO_URI')
mongo_db = os.getenv('MONGO_DB')

client = MongoClient(mongo_uri)
db = client[mongo_db]

activity_mets = [
    {"activity": "Running", "pace": "Slow", "met": 6.0},
    {"activity": "Running", "pace": "Moderate", "met": 8.3},
    {"activity": "Running", "pace": "Fast", "met": 11.5},

    {"activity": "Walking", "pace": "Slow", "met": 2.0},
    {"activity": "Walking", "pace": "Moderate", "met": 3.5},
    {"activity": "Walking", "pace": "Fast", "met": 4.5},

    {"activity": "Cycling", "pace": "Slow", "met": 4.0},
    {"activity": "Cycling", "pace": "Moderate", "met": 6.8},
    {"activity": "Cycling", "pace": "Fast", "met": 10.0}
]

# Clear existing collection
db.activityMETs.delete_many({})

# Insert new data
db.activityMETs.insert_many(activity_mets)

print("Activity METs seeded successfully!")
