import argparse
import sqlite3

def generate_reports(db_path: str, output_path: str):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM entries")
    total_entries = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM entries WHERE has_examples = 1")
    entries_with_examples = cursor.fetchone()[0]
    
    with open(output_path, "w") as f:
        f.write("Dictionary Report\n")
        f.write("================\n")
        f.write(f"Total Entries: {total_entries}\n")
        f.write(f"Entries with Examples: {entries_with_examples}\n")
        
    conn.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    generate_reports(args.db, args.out)
