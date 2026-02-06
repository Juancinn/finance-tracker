import csv
from datetime import datetime

class CibcImporter:
    def __init__(self, rule_engine=None):
        # We accept rule_engine to keep compatibility if passed, but we ignore it.
        # Categorization is now the Service's job.
        pass

    def parse(self, file_path, account_type):
        transactions = []
        
        with open(file_path, 'r') as f:
            reader = csv.reader(f)
            # Skip header if it exists (CIBC usually doesn't have headers, check your files)
            # next(reader, None) 

            for row in reader:
                if not row: continue

                # CIBC Format: Date, Description, Out, In
                date_str = row[0]
                desc = row[1]
                debit = row[2]
                credit = row[3]

                # Parse Date (YYYY-MM-DD)
                try:
                    date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                    formatted_date = date_obj.strftime('%Y-%m-%d')
                except ValueError:
                    continue # Skip invalid dates

                # Calculate Amount
                amount = 0.0
                if credit and credit.strip():
                    amount = float(credit)
                elif debit and debit.strip():
                    amount = -abs(float(debit))

                # Build Dict
                tx = {
                    "date": formatted_date,
                    "description": desc,
                    "amount": amount,
                    "account_type": account_type,
                    "category": "Uncategorized" # Default, Service will update this
                }
                transactions.append(tx)
                
        return transactions