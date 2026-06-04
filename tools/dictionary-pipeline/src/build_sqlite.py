import argparse
import sqlite3
import os

def build_schema(db_path: str):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            headword TEXT NOT NULL,
            normalized_headword TEXT NOT NULL,
            sort_key TEXT NOT NULL,
            entry_type TEXT NOT NULL,
            parent_entry_id INTEGER,
            part_of_speech TEXT,
            raw_part_of_speech TEXT,
            source_page INTEGER,
            raw_text TEXT NOT NULL,
            verification_status TEXT NOT NULL,
            extraction_confidence TEXT NOT NULL,
            has_examples INTEGER NOT NULL DEFAULT 0,
            has_notes INTEGER NOT NULL DEFAULT 0,
            has_variants INTEGER NOT NULL DEFAULT 0,
            created_at TEXT NOT NULL,
            updated_at TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS translations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entry_id INTEGER NOT NULL,
            spanish_text TEXT,
            english_text TEXT,
            translation_order INTEGER NOT NULL,
            is_literal INTEGER NOT NULL DEFAULT 0,
            note TEXT,
            FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS variants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entry_id INTEGER NOT NULL,
            variant_text TEXT NOT NULL,
            normalized_variant TEXT NOT NULL,
            variant_type TEXT NOT NULL,
            note TEXT,
            FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS examples (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entry_id INTEGER NOT NULL,
            miskito_text TEXT NOT NULL,
            spanish_text TEXT,
            english_text TEXT,
            source_code TEXT,
            source_detail TEXT,
            example_order INTEGER NOT NULL,
            is_literal_translation INTEGER NOT NULL DEFAULT 0,
            FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entry_id INTEGER NOT NULL,
            note_type TEXT NOT NULL,
            note_text TEXT NOT NULL,
            note_order INTEGER NOT NULL,
            FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS "references" (
            code TEXT PRIMARY KEY,
            short_name TEXT,
            full_description TEXT,
            language TEXT,
            reference_type TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS entry_references (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            entry_id INTEGER NOT NULL,
            example_id INTEGER,
            note_id INTEGER,
            reference_code TEXT,
            raw_reference_text TEXT NOT NULL,
            FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE,
            FOREIGN KEY(example_id) REFERENCES examples(id) ON DELETE CASCADE,
            FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE,
            FOREIGN KEY(reference_code) REFERENCES "references"(code) ON DELETE CASCADE
        )
    """)

    
    cursor.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING fts4(
            entry_id INTEGER,
            headword TEXT,
            normalized_headword TEXT,
            variants_text TEXT,
            spanish_text TEXT,
            english_text TEXT,
            examples_text TEXT,
            notes_text TEXT
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS favorites (
            entry_id INTEGER PRIMARY KEY,
            created_at TEXT NOT NULL,
            FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS history (
            entry_id INTEGER PRIMARY KEY,
            last_opened_at TEXT NOT NULL,
            open_count INTEGER NOT NULL DEFAULT 1,
            FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS metadata (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
        )
    """)
    
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS phrases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phrase_text TEXT NOT NULL,
            normalized_phrase TEXT NOT NULL,
            spanish_text TEXT,
            english_text TEXT,
            category TEXT NOT NULL,
            source_page INTEGER,
            raw_text TEXT NOT NULL
        )
    """)
    
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_entries_normalized ON entries(normalized_headword)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_entries_sort_key ON entries(sort_key)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_translations_entry_id ON translations(entry_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_variants_entry_id ON variants(entry_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_examples_entry_id ON examples(entry_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_notes_entry_id ON notes(entry_id)")
    
    conn.commit()
    conn.close()

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", required=True, help="Path to sqlite output file")
    args = parser.parse_args()
    
    # Ensure dir exists
    os.makedirs(os.path.dirname(args.db), exist_ok=True)
    build_schema(args.db)
