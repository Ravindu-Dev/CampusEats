import os
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGODB_URI = os.getenv('MONGODB_URI')
client = MongoClient(MONGODB_URI)
db = client.get_default_database()

print(f"Connected to database: {db.name}")

junk_names = ["juh", "qqq", "Chick", "Dunna gema"]

result_names = db.menu_items.delete_many({"name": {"$in": junk_names}})
print(f"Deleted {result_names.deleted_count} items with dummy names.")

result_price = db.menu_items.delete_many({"price": {"$lt": 0}})
print(f"Deleted {result_price.deleted_count} items with negative prices.")

client.close()
