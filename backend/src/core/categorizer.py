from typing import List, Tuple

class RuleEngine:
    def __init__(self, rules: List[Tuple[str, str]]):
        # rules is a list of (keyword, category)
        self.rules = rules

    def categorize(self, description: str) -> str:
        desc_upper = description.upper()

        # Check Database Rules
        for keyword, category in self.rules:
            if keyword.upper() in desc_upper:
                return category
        
        return "Uncategorized"