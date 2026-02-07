import os
import sys
from src.data.database import DatabaseConnection
from src.data.repositories.transactions import TransactionRepository
from src.data.repositories.rules import RuleRepository
from src.domain.services import TransactionService

CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CURRENT_DIR)
CSV_DIR = os.path.join(CURRENT_DIR, "..", "csv_imports")
DB_PATH = os.path.join(CURRENT_DIR, "finance.db")


def run():
    print("--- Starting Finance Tracker (CLI) ---")
    db = DatabaseConnection(DB_PATH)
    tx_repo = TransactionRepository(db)
    rule_repo = RuleRepository(db)
    
    service = TransactionService(tx_repo, rule_repo)
    
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