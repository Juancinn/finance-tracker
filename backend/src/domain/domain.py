from dataclasses import dataclass
from datetime import date
from typing import Optional

@dataclass(frozen=True)
class Transaction:
    """
    The Single Source of Truth for a transaction.
    """
    id: Optional[str] 
    date: date
    description: str
    amount: float
    currency: str      
    account_type: str  
    category: str      
    
    def is_expense(self) -> bool:
        if self.category in ["Transfer", "Income"]:
            return False
        return self.amount < 0

    def is_income(self) -> bool:
        return self.category == "Income"