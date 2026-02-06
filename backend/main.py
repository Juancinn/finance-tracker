import os
import sys

# 1. SETUP PATHS
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
# Ensure we can import from src
sys.path.append(CURRENT_DIR)

CSV_DIR = os.path.join(CURRENT_DIR, "..", "csv_imports")
DB_PATH = os.path.join(CURRENT_DIR, "finance.db")

# 2. NEW IMPORTS (Split Architecture)
from src.data.database import DatabaseConnection
from src.data.repositories.transactions import TransactionRepository
from src.data.repositories.rules import RuleRepository
from src.domain.services import TransactionService

def run():
    print("--- Starting Finance Tracker (CLI) ---")
    
    # 3. INITIALIZE DEPENDENCIES
    # Connect to DB
    db = DatabaseConnection(DB_PATH)
    
    # Init Repositories
    tx_repo = TransactionRepository(db)
    rule_repo = RuleRepository(db)
    
    # Init Service (Inject the specific repos it needs)
    service = TransactionService(tx_repo, rule_repo)
    
    # 4. RUN IMPORT
    # User ID 1 is You
    try:
        if not os.path.exists(CSV_DIR):
            print(f"Warning: CSV directory not found at {CSV_DIR}")
            return

        total, files = service.import_from_folder(CSV_DIR, user_id=1)
        print(f"--- Success! Processed {files} files. Added {total} new transactions. ---")
    except Exception as e:
        print(f"Critical Error: {e}")

if __name__ == "__main__":
    run()