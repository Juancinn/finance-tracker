import sqlite3
from typing import List, Optional, Dict, Any

class SqliteRepository:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def _get_conn(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    # Transactions
    def get_transaction(self, tx_id: int, user_id: int):
        conn = self._get_conn()
        row = conn.execute("SELECT * FROM transactions WHERE id = ? AND user_id = ?", (tx_id, user_id)).fetchone()
        conn.close()
        return dict(row) if row else None

    def get_transaction_signature(self, date: str, amount: float, description: str, user_id: int) -> bool:
        conn = self._get_conn()
        query = "SELECT 1 FROM transactions WHERE date = ? AND amount = ? AND description = ? AND user_id = ? LIMIT 1"
        cursor = conn.execute(query, (date, amount, description, user_id))
        result = cursor.fetchone()
        conn.close()
        return result is not None

    def create_transaction(self, data: Dict[str, Any], user_id: int):
        conn = self._get_conn()
        query = """
            INSERT INTO transactions (date, amount, description, category, account_type, user_id) 
            VALUES (?, ?, ?, ?, ?, ?)
        """
        conn.execute(query, (data['date'], data['amount'], data['description'], data['category'], data['account_type'], user_id))
        conn.commit()
        conn.close()

    def get_transactions(self, user_id: int, start_date: Optional[str] = None, end_date: Optional[str] = None):
        conn = self._get_conn()
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

    def update_transaction(self, tx_id: int, user_id: int, updates: Dict[str, Any]):
        conn = self._get_conn()
        fields = ", ".join([f"{k} = ?" for k in updates.keys()])
        values = list(updates.values())
        values.extend([tx_id, user_id])
        query = f"UPDATE transactions SET {fields} WHERE id = ? AND user_id = ?"
        conn.execute(query, values)
        conn.commit()
        conn.close()

    # CATEGORIES
    def get_categories(self, user_id: int):
        conn = self._get_conn()
        rows = conn.execute("SELECT * FROM categories WHERE user_id = ? ORDER BY name", (user_id,)).fetchall()
        results = []
        for row in rows:
            cat_dict = dict(row)
            count_query = "SELECT COUNT(*) FROM transactions WHERE category LIKE ? AND user_id = ?"
            count = conn.execute(count_query, ('%' + row['name'] + '%', user_id)).fetchone()[0]
            cat_dict['count'] = count
            results.append(cat_dict)
        conn.close()
        return results

    def create_category(self, name: str, type: str, user_id: int):
        conn = self._get_conn()
        conn.execute("INSERT INTO categories (name, type, user_id) VALUES (?, ?, ?)", (name, type, user_id))
        conn.commit()
        conn.close()

    def delete_category(self, name: str, user_id: int):
        conn = self._get_conn()
        conn.execute("DELETE FROM categories WHERE name = ? AND user_id = ?", (name, user_id))
        conn.execute("UPDATE transactions SET category = 'Uncategorized' WHERE category = ? AND user_id = ?", (name, user_id))
        conn.commit()
        conn.close()

    def update_category_name(self, old_name: str, new_name: str, user_id: int):
        conn = self._get_conn()
        conn.execute("UPDATE categories SET name = ? WHERE name = ? AND user_id = ?", (new_name, old_name, user_id))
        conn.execute("UPDATE transactions SET category = ? WHERE category = ? AND user_id = ?", (new_name, old_name, user_id))
        conn.commit()
        conn.close()
    
    def update_category_type(self, name: str, new_type: str, user_id: int):
        conn = self._get_conn()
        conn.execute("UPDATE categories SET type = ? WHERE name = ? AND user_id = ?", (new_type, name, user_id))
        conn.commit()
        conn.close()

    # Rules
    def get_rules(self, user_id: int):
        conn = self._get_conn()
        rows = conn.execute("SELECT * FROM rules WHERE user_id = ?", (user_id,)).fetchall()
        conn.close()
        return [dict(row) for row in rows]

    def create_rule(self, keyword: str, category: str, user_id: int):
        conn = self._get_conn()
        conn.execute("INSERT INTO rules (keyword, category, user_id) VALUES (?, ?, ?)", (keyword, category, user_id))
        conn.commit()
        conn.close()