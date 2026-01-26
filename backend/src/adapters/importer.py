import csv
import hashlib
from datetime import datetime
from typing import List
from src.core.domain import Transaction
from src.core.categorizer import RuleEngine

class CibcImporter:
    def __init__(self, rule_engine: RuleEngine):
        self.rule_engine = rule_engine

    def parse(self, file_path: str, account_type: str) -> List[Transaction]:
        transactions = []
        try:
            with open(file_path, 'r', encoding='utf-8-sig') as f:
                reader = csv.reader(f)
                for row in reader:
                    if not row: continue
                    
                    t_date = datetime.strptime(row[0], '%Y-%m-%d').date()
                    desc = row[1].strip()
                    debit = float(row[2]) if row[2] else 0.0
                    credit = float(row[3]) if row[3] else 0.0
                    amount = credit - debit 

                    unique_str = f"{t_date}{desc}{amount}"
                    t_id = hashlib.md5(unique_str.encode()).hexdigest()

                    category = self.rule_engine.categorize(desc)

                    transactions.append(Transaction(
                        id=t_id, date=t_date, description=desc, amount=amount,
                        currency="CAD", account_type=account_type,
                        category=category
                    ))
        except Exception as e:
            print(f"Error reading {file_path}: {e}")
            
        return transactions