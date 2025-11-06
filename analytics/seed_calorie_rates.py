# seed_calorie_rates.py
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

mongo_uri = os.getenv('MONGO_URI')
mongo_db = os.getenv('MONGO_DB')

client = MongoClient(mongo_uri)
db = client[mongo_db]

calorie_rates = [
    {"exerciseType": "Running", "caloriesPerMinute": 10},
    {"exerciseType": "Cycling", "caloriesPerMinute": 8},
    {"exerciseType": "Swimming", "caloriesPerMinute": 11},
    {"exerciseType": "Walking", "caloriesPerMinute": 4}
]

db.calorieRates.delete_many({})
db.calorieRates.insert_many(calorie_rates)

print("Calorie rates seeded successfully!")
