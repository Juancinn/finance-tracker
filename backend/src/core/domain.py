from dataclasses import dataclass
from datetime import date
from typing import Optional

@dataclass(frozen=True)
class Transaction:
    """
    The Single Source of Truth for a transaction.
    """
    id: Optional[str] # Unique Hash
    date: date
    description: str
    amount: float
    currency: str      # 'CAD' or 'USD'
    account_type: str  # 'Chequing', 'Visa', 'Savings'
    category: str      # e.g., "Food", "Rent"
    
    def is_expense(self) -> bool:
        if self.category in ["Transfer", "Income"]:
            return False
        return self.amount < 0

    def is_income(self) -> bool:
        return self.category == "Income"