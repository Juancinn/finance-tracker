import os
import sys

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
CSV_DIR = os.path.join(CURRENT_DIR, "..", "csv_imports")
DB_PATH = os.path.join(CURRENT_DIR, "finance.db")

from src.data.repository import SqliteRepository
from src.domain.services import TransactionService

def run():
    print("--- Starting Finance Tracker (CLI) ---")
    
    # Initialize Core Layers
    repo = SqliteRepository(DB_PATH)
    service = TransactionService(repo)
    
    # Run Import
    # User ID 1 is Me
    try:
        total, files = service.import_from_folder(CSV_DIR, user_id=1)
        print(f"--- Success! Processed {files} files. Added {total} new transactions. ---")
    except Exception as e:
        print(f"Critical Error: {e}")

if __name__ == "__main__":
    run()