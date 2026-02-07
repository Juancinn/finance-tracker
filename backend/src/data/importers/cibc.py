import csv

class CibcImporter:
    def __init__(self, rule_engine=None):
        pass

    def parse(self, file_path, account_type):
        transactions = []
        with open(file_path, mode='r', encoding='utf-8') as f:
            reader = csv.reader(f)
            for row in reader:
                # Ensure we have at least date, description, and one amount column
                if not row or len(row) < 3:
                    continue
                
                date = row[0].strip()
                description = row[1].strip()
                
                # Column 3 is usually Out/Purchase, Column 4 is In/Payment
                val_col_3 = row[2].strip()
                val_col_4 = row[3].strip() if len(row) > 3 else ""

                amount = 0.0
                try:
                    if account_type == "Visa":
                        # In Visa CSVs, purchases are positive in col 3. 
                        # We make them negative to represent an expense.
                        if val_col_3:
                            amount = -float(val_col_3.replace(',', ''))
                        elif val_col_4:
                            # Payments to the card are positive (reducing debt)
                            amount = float(val_col_4.replace(',', ''))
                    else:
                        # Chequing/Savings: Col 3 is Withdrawal (-), Col 4 is Deposit (+)
                        if val_col_3:
                            amount = -float(val_col_3.replace(',', ''))
                        elif val_col_4:
                            amount = float(val_col_4.replace(',', ''))
                        else:
                            continue
                except ValueError:
                    continue

                transactions.append({
                    "date": date,
                    "description": description,
                    "amount": amount,
                    "account_type": account_type,
                    "currency": "CAD"
                })
        return transactions