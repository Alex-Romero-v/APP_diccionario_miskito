import os
import sqlite3
import tempfile
from src.build_sqlite import build_schema

def test_build_sqlite():
    with tempfile.NamedTemporaryFile(suffix=".db", delete=False) as f:
        db_path = f.name
    
    try:
        build_schema(db_path)
        
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = set(r[0] for r in cursor.fetchall())
        
        expected_tables = {
            "entries", "translations", "variants", "examples", "notes", 
            "references", "entry_references", "search_index", "favorites", 
            "history", "metadata", "phrases"
        }
        
        for table in expected_tables:
            assert table in tables
            
        conn.close()
    finally:
        if os.path.exists(db_path):
            os.remove(db_path)
