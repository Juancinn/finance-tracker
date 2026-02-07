from typing import List, Dict, Any
import os
from ..data.repositories.transactions import TransactionRepository
from ..data.repositories.rules import RuleRepository

class TransactionService:
    def __init__(self, tx_repo: TransactionRepository, rule_repo: RuleRepository):
        self.tx_repo = tx_repo
        self.rule_repo = rule_repo

    def import_transactions(self, raw_transactions: List[Dict[str, Any]], user_id: int) -> int:
        rules = self.rule_repo.get_all(user_id)
        added_count = 0

        for tx in raw_transactions:
            # 1. Deduplicate by Signature (Date + Description)
            if self.tx_repo.exists(tx['date'], tx['amount'], tx['description'], user_id):
                continue 

            # 2. Savings Rule
            if tx['account_type'] == 'Savings':
                tx['category'] = 'Transfer'
            else:
                # 3. Auto-Categorize
                assigned_category = 'Uncategorized'
                for rule in rules:
                    if rule['keyword'].lower() in tx['description'].lower():
                        assigned_category = rule['category']
                        break
                tx['category'] = assigned_category

            self.tx_repo.create(tx, user_id)
            added_count += 1
        return added_count

    def split_transaction(self, tx_id: int, split_amount: float, user_id: int):
        tx = self.tx_repo.get_by_id(tx_id, user_id)
        if not tx:
            raise ValueError("Transaction not found")

        original_amount = tx['amount']
        
        sign = 1 if original_amount >= 0 else -1

        actual_split_value = abs(split_amount) * sign

        if abs(actual_split_value) >= abs(original_amount):
             raise ValueError("Split amount cannot be greater than or equal to the original total.")

        new_original_amount = original_amount - actual_split_value
        self.tx_repo.update(tx_id, user_id, {"amount": new_original_amount})

        # 2. Create the new split record inheriting parent metadata
        new_tx = {
            "date": tx['date'],
            "description": tx['description'] + " (Split)",
            "amount": actual_split_value,
            "category": tx.get('category', 'Uncategorized'),
            "account_type": tx['account_type'],
            "currency": tx.get('currency', 'CAD')
        }
        self.tx_repo.create(new_tx, user_id)

    def import_from_folder(self, folder_path: str, user_id: int):
        from ..data.importers.cibc import CibcImporter 
        
        importer = CibcImporter()
        if not os.path.exists(folder_path):
            raise FileNotFoundError(f"Directory {folder_path} not found.")

        total_added = 0
        files_processed = 0

        for filename in os.listdir(folder_path):
            if not filename.endswith(".csv"): continue

            fname = filename.lower()
            account_type = None
            if "chequing" in fname: account_type = "Chequing"
            elif "credit" in fname or "visa" in fname: account_type = "Visa"
            elif "savings" in fname: account_type = "Savings"

            if account_type:
                try:
                    raw_txns = importer.parse(os.path.join(folder_path, filename), account_type)
                    added = self.import_transactions(raw_txns, user_id)
                    total_added += added
                    files_processed += 1
                except Exception as e:
                    print(f"Error reading file {filename}: {e}")

        return total_added, files_processed