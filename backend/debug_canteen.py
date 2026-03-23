import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGODB_URI)
db = client.get_default_database()

print(f"Connected to database: {db.name}")

print("\n--- Canteen Owners ---")
owners = list(db.canteen_owners.find())
for o in owners:
    print(f"Owner ID: {o.get('_id')}, Name: {o.get('ownerName')}, Email: {o.get('email')}, CanteenID: {o.get('canteenId')}, Status: {o.get('approvalStatus')}")

print("\n--- Canteens ---")
canteens = list(db.canteens.find())
for c in canteens:
    print(f"Canteen ID: {c.get('_id')}, Name: {c.get('canteenName')}, OwnerID: {c.get('ownerId')}, Status: {c.get('status')}")

# Check for mismatches
print("\n--- Mismatch Check ---")
for o in owners:
    cid = o.get('canteenId')
    email = o.get('email')
    if cid:
        canteen = db.canteens.find_one({'_id': cid})
        if not canteen:
            # Check if it's there as a string ID instead of ObjectId
            canteen = db.canteens.find_one({'_id': str(cid)})
            if not canteen:
                 print(f"Error: Owner {email} has canteenId {cid} but no such canteen exists!")
            else:
                 print(f"OK: Owner {email} linked to canteen {canteen.get('canteenName')} (string ID)")
        else:
            print(f"OK: Owner {email} linked to canteen {canteen.get('canteenName')} (ObjectId)")
    else:
        print(f"Warning: Owner {email} has NO canteenId!")

client.close()
