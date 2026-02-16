import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGODB_URI)
db = client.get_default_database()

canteens_col = db.canteens

print("--- Fixing all invalid averagePreparationTime values ---")
# Find all documents where averagePreparationTime is a string
for c in canteens_col.find({"averagePreparationTime": {"$type": "string"}}):
    val = c.get('averagePreparationTime')
    print(f"Fixing canteen {c.get('canteenName')} - value '{val}' to 15")
    canteens_col.update_one({"_id": c.get('_id')}, {"$set": {"averagePreparationTime": 15}})


client.close()
