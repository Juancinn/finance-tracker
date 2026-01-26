import os
import sys

# 1. SETUP PATHS
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(CURRENT_DIR)

CSV_DIR = os.path.join(CURRENT_DIR, "..", "csv_imports")
DB_FILE = os.path.join(CURRENT_DIR, "finance.db")

from src.adapters.importer import CibcImporter
from src.adapters.repository import SqliteRepository
from src.core.categorizer import RuleEngine

def determine_account_type(filename):
    fname = filename.lower()
    if "chequing" in fname:
        return "Chequing"
    elif "credit" in fname or "visa" in fname:
        return "Visa"
    elif "savings" in fname:
        return "Savings"
    else:
        return None

def run():
    print(f"--- Starting Finance Tracker ---")
    print(f"Scanning folder: {os.path.abspath(CSV_DIR)}")
    
    repo = SqliteRepository(DB_FILE)
    
    rules = repo.get_all_rules()
    engine = RuleEngine(rules)
    
    importer = CibcImporter(rule_engine=engine)
    
    all_transactions = []
    processed_count = 0

    if not os.path.exists(CSV_DIR):
        print(f"Error: Directory {CSV_DIR} does not exist.")
        return

    for filename in os.listdir(CSV_DIR):
        if not filename.endswith(".csv"):
            continue

        account_type = determine_account_type(filename)
        
        if account_type:
            print(f"Processing {filename} as [{account_type}]...")
            file_path = os.path.join(CSV_DIR, filename)
            
            try:
                new_txns = importer.parse(file_path, account_type)
                all_transactions.extend(new_txns)
                print(f"  -> Found {len(new_txns)} transactions.")
                processed_count += 1
            except Exception as e:
                print(f"  -> Error reading file: {e}")
        else:
            print(f"Skipping {filename} (Could not identify account type)")

    if all_transactions:
        repo.save_bulk(all_transactions)
        print(f"--- Success! Processed {processed_count} files. Database updated. ---")
    else:
        print("--- No valid transactions found. ---")

if __name__ == "__main__":
    run()