import sqlite3
from typing import List, Tuple
from src.core.domain import Transaction

class SqliteRepository:
    def __init__(self, db_path: str):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        with sqlite3.connect(self.db_path) as conn:
            # 1. Transactions Table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS transactions (
                    id TEXT PRIMARY KEY,
                    date TEXT,
                    description TEXT,
                    amount REAL,
                    currency TEXT,
                    account_type TEXT,
                    category TEXT
                )
            """)
            
            # 2. Categories Table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS categories (
                    name TEXT PRIMARY KEY,
                    type TEXT
                )
            """)

            # 3. Rules Table
            conn.execute("""
                CREATE TABLE IF NOT EXISTS rules (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    keyword TEXT UNIQUE,
                    category TEXT,
                    FOREIGN KEY(category) REFERENCES categories(name)
                )
            """)
            
            # Seed generic defaults if empty
            cursor = conn.cursor()
            cursor.execute("SELECT count(*) FROM categories")
            if cursor.fetchone()[0] == 0:
                self._seed_defaults(conn)

    def _seed_defaults(self, conn):
        categories = [
            ('Uncategorized', 'General'),
            ('Income', 'Income'), 
            ('Transfer', 'Passthrough'),
            ('Opening Balance', 'Passthrough'),
            ('Payment', 'Passthrough')
        ]
        conn.executemany("INSERT OR IGNORE INTO categories (name, type) VALUES (?, ?)", categories)
        
        rules = [
            ('PAYROLL', 'Income'),
            ('PAYMENT THANK YOU', 'Transfer')
        ]
        conn.executemany("INSERT OR IGNORE INTO rules (keyword, category) VALUES (?, ?)", rules)
        conn.commit()

    def get_all_rules(self) -> List[Tuple[str, str]]:
        with sqlite3.connect(self.db_path) as conn:
            return conn.execute("SELECT keyword, category FROM rules").fetchall()

    def save_bulk(self, transactions: List[Transaction]):
        if not transactions:
            return

        data = [
            (t.id, t.date, t.description, t.amount, t.currency, 
             t.account_type, t.category)
            for t in transactions
        ]
        
        with sqlite3.connect(self.db_path) as conn:
            conn.executemany("""
                INSERT OR IGNORE INTO transactions 
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, data)
            print(f"Saved {len(data)} transactions to database.")