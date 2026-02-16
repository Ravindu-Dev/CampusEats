import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI')
if not MONGODB_URI:
    print("Error: MONGODB_URI not found in .env file")
    exit(1)

client = MongoClient(MONGODB_URI)
db = client.get_default_database()

print(f"Connected to database: {db.name}")

canteens_col = db.canteens
menu_items_col = db.menu_items

print("\n--- Current Canteens ---")
canteens = list(canteens_col.find())
for c in canteens:
    print(f"ID: {c.get('_id')}, Name: {c.get('canteenName')}, Status: {c.get('status')}, Active: {c.get('active')}")

print("\n--- Unique Canteen IDs in Menu Items ---")
unique_ids = menu_items_col.distinct('canteenId')
print(f"Found {len(unique_ids)} unique canteen IDs in menu items: {unique_ids}")

# Check for canteens that exist in menu items but not in canteens collection
for cid in unique_ids:
    if cid and not canteens_col.find_one({'_id': cid}):
        print(f"Warning: Canteen ID {cid} exists in menu items but NOT in canteens collection!")
        # Optional: Add a placeholder canteen if requested or appropriate
        # canteens_col.insert_one({'_id': cid, 'canteenName': f'Canteen {cid[:4]}', 'status': 'APPROVED', 'active': True})

# Ensure all canteens are APPROVED and ACTIVE for visibility if that's the goal
# result = canteens_col.update_many({'status': {'$ne': 'APPROVED'}}, {'$set': {'status': 'APPROVED'}})
# print(f"Updated {result.modified_count} canteens to APPROVED")

client.close()
