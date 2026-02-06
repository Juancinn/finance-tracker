from typing import List, Dict
from ..database import DatabaseConnection

class RuleRepository:
    def __init__(self, db: DatabaseConnection):
        self.db = db

    def get_all(self, user_id: int) -> List[Dict[str, str]]:
        conn = self.db.get_connection()
        rows = conn.execute("SELECT * FROM rules WHERE user_id = ?", (user_id,)).fetchall()
        conn.close()
        return [dict(row) for row in rows]

    def create(self, keyword: str, category: str, user_id: int):
        conn = self.db.get_connection()
        conn.execute("INSERT INTO rules (keyword, category, user_id) VALUES (?, ?, ?)", (keyword, category, user_id))
        conn.commit()
        conn.close()