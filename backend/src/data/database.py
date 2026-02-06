import sqlite3
import os

class DatabaseConnection:
    def __init__(self, db_path: str):
        self.db_path = db_path

    def get_connection(self):
        """Returns a configured SQLite connection."""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn