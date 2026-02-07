from typing import Dict, Any, Optional, List
from ..database import DatabaseConnection

class TransactionRepository:
    def __init__(self, db: DatabaseConnection):
        self.db = db

    def get_by_id(self, tx_id: int, user_id: int) -> Optional[Dict[str, Any]]:
        conn = self.db.get_connection()
        row = conn.execute("SELECT * FROM transactions WHERE id = ? AND user_id = ?", (tx_id, user_id)).fetchone()
        conn.close()
        return dict(row) if row else None

    def exists(self, date: str, amount: float, description: str, user_id: int, account_type: str) -> bool:
        """Checks if a transaction or its splits already exist by signature in a specific account."""
        conn = self.db.get_connection()
        query = """
            SELECT 1 FROM transactions 
            WHERE date = ? 
            AND (description = ? OR description = ? || ' (Split)')
            AND account_type = ?
            AND user_id = ? 
            LIMIT 1
        """
        cursor = conn.execute(query, (date, description, description, account_type, user_id))
        result = cursor.fetchone()
        conn.close()
        return result is not None

    def create(self, data: Dict[str, Any], user_id: int):
        conn = self.db.get_connection()
        query = """
            INSERT INTO transactions (date, amount, description, category, account_type, user_id) 
            VALUES (?, ?, ?, ?, ?, ?)
        """
        conn.execute(query, (
            data['date'], 
            data['amount'], 
            data['description'], 
            data.get('category', 'Uncategorized'), 
            data['account_type'], 
            user_id
        ))
        conn.commit()
        conn.close()

    def get_all(self, user_id: int, start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[Dict[str, Any]]:
        conn = self.db.get_connection()
        query = "SELECT * FROM transactions WHERE user_id = ?"
        params = [user_id]

        if start_date and end_date:
            query += " AND date BETWEEN ? AND ?"
            params.extend([start_date, end_date])
        elif start_date:
            query += " AND date >= ?"
            params.append(start_date)
            
        query += " ORDER BY date DESC, id DESC"
        rows = conn.execute(query, params).fetchall()
        conn.close()
        return [dict(row) for row in rows]

    def update(self, tx_id: int, user_id: int, updates: Dict[str, Any]):
        conn = self.db.get_connection()
        fields = ", ".join([f"{k} = ?" for k in updates.keys()])
        values = list(updates.values())
        values.extend([tx_id, user_id])
        
        query = f"UPDATE transactions SET {fields} WHERE id = ? AND user_id = ?"
        conn.execute(query, values)
        conn.commit()
        conn.close()