from typing import List, Dict, Any
from ..database import DatabaseConnection

class CategoryRepository:
    def __init__(self, db: DatabaseConnection):
        self.db = db

    def get_all(self, user_id: int) -> List[Dict[str, Any]]:
        conn = self.db.get_connection()
        rows = conn.execute("SELECT * FROM categories WHERE user_id = ? ORDER BY name", (user_id,)).fetchall()
        
        results = []
        for row in rows:
            cat_dict = dict(row)
            # Count usage for UI stats
            count_query = "SELECT COUNT(*) FROM transactions WHERE category LIKE ? AND user_id = ?"
            count = conn.execute(count_query, ('%' + row['name'] + '%', user_id)).fetchone()[0]
            cat_dict['count'] = count
            results.append(cat_dict)
            
        conn.close()
        return results

    def create(self, name: str, cat_type: str, user_id: int):
        conn = self.db.get_connection()
        conn.execute("INSERT INTO categories (name, type, user_id) VALUES (?, ?, ?)", (name, cat_type, user_id))
        conn.commit()
        conn.close()

    def delete(self, name: str, user_id: int):
        conn = self.db.get_connection()
        conn.execute("DELETE FROM categories WHERE name = ? AND user_id = ?", (name, user_id))
        # Reset transactions to Uncategorized
        conn.execute("UPDATE transactions SET category = 'Uncategorized' WHERE category = ? AND user_id = ?", (name, user_id))
        conn.commit()
        conn.close()

    def update_name(self, old_name: str, new_name: str, user_id: int):
        conn = self.db.get_connection()
        conn.execute("UPDATE categories SET name = ? WHERE name = ? AND user_id = ?", (new_name, old_name, user_id))
        # Update history
        conn.execute("UPDATE transactions SET category = ? WHERE category = ? AND user_id = ?", (new_name, old_name, user_id))
        conn.commit()
        conn.close()

    def update_type(self, name: str, new_type: str, user_id: int):
        conn = self.db.get_connection()
        conn.execute("UPDATE categories SET type = ? WHERE name = ? AND user_id = ?", (new_type, name, user_id))
        conn.commit()
        conn.close()