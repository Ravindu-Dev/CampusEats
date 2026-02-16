import os
import json
from bson import ObjectId
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGODB_URI)
db = client.get_default_database()

canteens_col = db.canteens
menu_items_col = db.menu_items

print("--- Inspecting Full Canteen Documents ---")
for c in canteens_col.find():
    # Convert ObjectId to string for printing
    c_copy = c.copy()
    c_copy['_id'] = str(c_copy['_id'])
    print(json.dumps(c_copy, indent=2, default=str))

print("\n--- Fixing Data Gaps ---")
unique_ids = menu_items_col.distinct('canteenId')
for cid in unique_ids:
    if not cid: continue
    
    # Check if canteen exists
    canteen = canteens_col.find_one({'_id': cid if isinstance(cid, ObjectId) else cid})
    if not canteen:
        # Check if it exists with string ID if it was an ObjectId or vice-versa
        try:
            if isinstance(cid, str):
                canteen = canteens_col.find_one({'_id': ObjectId(cid)})
        except: pass
        
    if not canteen:
        print(f"Creating missing canteen for ID: {cid}")
        canteens_col.insert_one({
            '_id': cid, 
            'canteenName': f'Canteen {str(cid)[:4]}', 
            'status': 'APPROVED', 
            'active': True,
            'verified': True,
            'rating': 4.0,
            'totalRatings': 1,
            'description': 'A newly registered campus canteen.'
        })

# Ensure all canteens are visible
result = canteens_col.update_many({}, {'$set': {'status': 'APPROVED', 'active': True, 'verified': True}})
print(f"Updated {result.modified_count} canteens to be visible (APPROVED and active)")

client.close()
