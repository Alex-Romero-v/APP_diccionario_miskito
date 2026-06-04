import argparse
import sqlite3

def populate_search_index(db_path: str):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("""
        INSERT INTO search_index(entry_id, headword, normalized_headword)
        SELECT id, headword, normalized_headword FROM entries
    """)
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", required=True)
    args = parser.parse_args()
    populate_search_index(args.db)
