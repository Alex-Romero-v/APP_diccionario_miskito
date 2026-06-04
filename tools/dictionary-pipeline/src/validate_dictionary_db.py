import argparse
import sqlite3
import sys

def validate_db(db_path: str) -> bool:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check required tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = set(r[0] for r in cursor.fetchall())
        required = {"entries", "translations", "variants", "examples", "notes", "references", "entry_references", "search_index", "favorites", "history", "metadata", "phrases"}
        if not required.issubset(tables):
            return False
            
        cursor.execute("SELECT COUNT(*) FROM favorites")
        if cursor.fetchone()[0] != 0:
            return False
            
        cursor.execute("SELECT COUNT(*) FROM history")
        if cursor.fetchone()[0] != 0:
            return False
            
        return True
    finally:
        conn.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", required=True)
    args = parser.parse_args()
    
    if not validate_db(args.db):
        sys.exit(1)
