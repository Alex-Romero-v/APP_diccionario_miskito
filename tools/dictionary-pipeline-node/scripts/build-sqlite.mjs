import fs from 'node:fs';
import path from 'node:path';
import Database from 'better-sqlite3';

function normalizeText(text) {
    if (!text) return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function mapEntryToParams(entry, id) {
    const variants = entry.variant_forms || entry.variants || [];
    const sourcePage = entry.source?.page ?? entry.source_page ?? null;
    const verificationStatus = entry.review_state || entry.verification_status || 'approved';
    const extractionConfidence = entry.confidence?.overall ?? entry.extraction_confidence ?? 1.0;

    const entryParams = {
        id,
        headword: entry.headword || '',
        normalized_headword: normalizeText(entry.headword || ''),
        sort_key: normalizeText(entry.headword || ''),
        entry_type: entry.entry_type || 'word',
        parent_entry_id: null,
        part_of_speech: entry.part_of_speech || null,
        raw_part_of_speech: entry.raw_part_of_speech || entry.segments?.part_of_speech_segment || null,
        source_page: sourcePage,
        raw_text: entry.raw_text || '',
        verification_status: verificationStatus,
        extraction_confidence: extractionConfidence.toString(),
        has_examples: entry.examples?.length ? 1 : 0,
        has_notes: entry.notes?.length ? 1 : 0,
        has_variants: variants.length ? 1 : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const translationParams = [];
    let order = 0;
    for (const t of entry.translations || []) {
        translationParams.push({
            entry_id: id,
            spanish_text: t.spanish || null,
            english_text: t.english || null,
            translation_order: order++,
            is_literal: t.is_literal ? 1 : 0,
            note: null
        });
    }

    const variantParams = [];
    const variantSearchText = [];
    for (const v of variants) {
        const text = v.text || '';
        variantParams.push({
            entry_id: id,
            variant_text: text,
            normalized_variant: normalizeText(text),
            variant_type: v.type || 'spelling',
            note: null
        });
        if (text) variantSearchText.push(normalizeText(text));
    }

    const exampleParams = [];
    const exampleSearchText = [];
    let exampleOrder = 0;
    for (const x of entry.examples || []) {
        exampleParams.push({
            entry_id: id,
            miskito_text: x.miskito || '',
            spanish_text: x.spanish || null,
            english_text: x.english || null,
            source_code: null,
            source_detail: null,
            example_order: exampleOrder++,
            is_literal_translation: x.translation_is_literal ? 1 : 0
        });
        if (x.miskito) exampleSearchText.push(normalizeText(x.miskito));
        if (x.english) exampleSearchText.push(normalizeText(x.english));
        if (x.spanish) exampleSearchText.push(normalizeText(x.spanish));
    }

    const noteParams = [];
    const noteSearchText = [];
    let noteOrder = 0;
    for (const n of entry.notes || []) {
        noteParams.push({
            entry_id: id,
            note_type: n.type || 'grammar',
            note_text: n.text || '',
            note_order: noteOrder++
        });
        if (n.text) noteSearchText.push(normalizeText(n.text));
    }

    const translations = entry.translations || [];
    const searchDocParams = {
        entry_id: id,
        headword: entry.headword || '',
        normalized_headword: normalizeText(entry.headword || ''),
        variants_text: variantSearchText.join(' '),
        spanish_text: (translations.map(t => t.spanish).filter(Boolean).join(' ') + ' ' + (entry.segments?.definition_segment || '')).trim(),
        english_text: (translations.map(t => t.english).filter(Boolean).join(' ') + ' ' + (entry.raw_text || '')).trim(),
        examples_text: exampleSearchText.join(' '),
        notes_text: noteSearchText.join(' ')
    };

    return {
        entryParams,
        translationParams,
        variantParams,
        exampleParams,
        noteParams,
        searchDocParams
    };
}

function assertGeneratedDatabaseIsReadable(dbPath) {
    const db = new Database(dbPath, { readonly: true });
    try {
        const integrity = db.pragma('integrity_check');
        const ok = integrity.length === 1 && integrity[0].integrity_check === 'ok';
        if (!ok) {
            throw new Error(`Generated database failed integrity_check: ${JSON.stringify(integrity)}`);
        }
    } finally {
        db.close();
    }
}

export function buildSqlite(handoffDir, outDbPath) {
    fs.mkdirSync(path.dirname(outDbPath), { recursive: true });
    if (fs.existsSync(outDbPath)) {
        fs.rmSync(outDbPath, { force: true });
    }

    const db = new Database(outDbPath);

    db.exec(`
        PRAGMA foreign_keys = ON;
        CREATE TABLE metadata(key TEXT NOT NULL PRIMARY KEY, value TEXT NOT NULL);
        CREATE TABLE entries(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, headword TEXT NOT NULL, normalized_headword TEXT NOT NULL, sort_key TEXT NOT NULL, entry_type TEXT NOT NULL, parent_entry_id INTEGER, part_of_speech TEXT, raw_part_of_speech TEXT, source_page INTEGER, raw_text TEXT NOT NULL, verification_status TEXT NOT NULL, extraction_confidence TEXT NOT NULL, has_examples INTEGER NOT NULL, has_notes INTEGER NOT NULL, has_variants INTEGER NOT NULL, created_at TEXT NOT NULL, updated_at TEXT);
        CREATE TABLE translations(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, entry_id INTEGER NOT NULL, spanish_text TEXT, english_text TEXT, translation_order INTEGER NOT NULL, is_literal INTEGER NOT NULL, note TEXT, FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE);
        CREATE INDEX index_translations_entry_id ON translations(entry_id);
        CREATE TABLE variants(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, entry_id INTEGER NOT NULL, variant_text TEXT NOT NULL, normalized_variant TEXT NOT NULL, variant_type TEXT NOT NULL, note TEXT, FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE);
        CREATE INDEX index_variants_entry_id ON variants(entry_id);
        CREATE TABLE examples(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, entry_id INTEGER NOT NULL, miskito_text TEXT NOT NULL, spanish_text TEXT, english_text TEXT, source_code TEXT, source_detail TEXT, example_order INTEGER NOT NULL, is_literal_translation INTEGER NOT NULL, FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE);
        CREATE INDEX index_examples_entry_id ON examples(entry_id);
        CREATE TABLE notes(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, entry_id INTEGER NOT NULL, note_type TEXT NOT NULL, note_text TEXT NOT NULL, note_order INTEGER NOT NULL, FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE);
        CREATE INDEX index_notes_entry_id ON notes(entry_id);
        CREATE TABLE "references"(code TEXT NOT NULL, short_name TEXT, full_description TEXT, language TEXT, reference_type TEXT, PRIMARY KEY(code));
        CREATE TABLE entry_references(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, entry_id INTEGER NOT NULL, example_id INTEGER, note_id INTEGER, reference_code TEXT, raw_reference_text TEXT NOT NULL, FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE, FOREIGN KEY(example_id) REFERENCES examples(id) ON DELETE CASCADE, FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE, FOREIGN KEY(reference_code) REFERENCES "references"(code) ON DELETE CASCADE);
        CREATE TABLE phrases(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, phrase_text TEXT NOT NULL, normalized_phrase TEXT NOT NULL, spanish_text TEXT, english_text TEXT, category TEXT NOT NULL, source_page INTEGER, raw_text TEXT NOT NULL);
        CREATE VIRTUAL TABLE search_index USING FTS4(entry_id INTEGER NOT NULL, headword TEXT NOT NULL, normalized_headword TEXT NOT NULL, variants_text TEXT, spanish_text TEXT, english_text TEXT, examples_text TEXT, notes_text);
        CREATE TABLE favorites(entry_id INTEGER NOT NULL PRIMARY KEY, created_at TEXT NOT NULL, FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE);
        CREATE TABLE history(entry_id INTEGER NOT NULL PRIMARY KEY, last_opened_at TEXT NOT NULL, open_count INTEGER NOT NULL, FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE);
        CREATE TABLE room_master_table (id INTEGER PRIMARY KEY, identity_hash TEXT);
        INSERT OR REPLACE INTO room_master_table (id, identity_hash) VALUES(42, 'db0fae11f313161947aeedbba5d5bb2a');
    `);

    const insertMetadata = db.prepare('INSERT INTO metadata (key, value) VALUES (@key, @value)');
    const insertEntry = db.prepare('INSERT INTO entries (id, headword, normalized_headword, sort_key, entry_type, parent_entry_id, part_of_speech, raw_part_of_speech, source_page, raw_text, verification_status, extraction_confidence, has_examples, has_notes, has_variants, created_at, updated_at) VALUES (@id, @headword, @normalized_headword, @sort_key, @entry_type, @parent_entry_id, @part_of_speech, @raw_part_of_speech, @source_page, @raw_text, @verification_status, @extraction_confidence, @has_examples, @has_notes, @has_variants, @created_at, @updated_at)');
    const insertTranslation = db.prepare('INSERT INTO translations (entry_id, spanish_text, english_text, translation_order, is_literal, note) VALUES (@entry_id, @spanish_text, @english_text, @translation_order, @is_literal, @note)');
    const insertVariant = db.prepare('INSERT INTO variants (entry_id, variant_text, normalized_variant, variant_type, note) VALUES (@entry_id, @variant_text, @normalized_variant, @variant_type, @note)');
    const insertExample = db.prepare('INSERT INTO examples (entry_id, miskito_text, spanish_text, english_text, source_code, source_detail, example_order, is_literal_translation) VALUES (@entry_id, @miskito_text, @spanish_text, @english_text, @source_code, @source_detail, @example_order, @is_literal_translation)');
    const insertNote = db.prepare('INSERT INTO notes (entry_id, note_type, note_text, note_order) VALUES (@entry_id, @note_type, @note_text, @note_order)');
    const insertSearchDoc = db.prepare('INSERT INTO search_index (entry_id, headword, normalized_headword, variants_text, spanish_text, english_text, examples_text, notes_text) VALUES (@entry_id, @headword, @normalized_headword, @variants_text, @spanish_text, @english_text, @examples_text, @notes_text)');

    let entriesDir = path.join(handoffDir, 'dictionary_entries');
    if (!fs.existsSync(entriesDir)) {
        entriesDir = path.join(handoffDir, 'tools/dictionary-pipeline/intermediate/dictionary_entries');
    }
    if (!fs.existsSync(entriesDir)) {
        db.close();
        throw new Error(`Directory not found: ${entriesDir}`);
    }

    const files = fs.readdirSync(entriesDir).filter(file => file.endsWith('.jsonl')).sort();
    let entriesCount = 0;

    const insertEntries = db.transaction(() => {
        for (const file of files) {
            const filePath = path.join(entriesDir, file);
            const lines = fs.readFileSync(filePath, 'utf8').split('\n');
            for (const line of lines) {
                if (!line.trim()) continue;

                entriesCount++;
                const entry = JSON.parse(line);
                const mapped = mapEntryToParams(entry, entriesCount);

                insertEntry.run(mapped.entryParams);
                mapped.translationParams.forEach(params => insertTranslation.run(params));
                mapped.variantParams.forEach(params => insertVariant.run(params));
                mapped.exampleParams.forEach(params => insertExample.run(params));
                mapped.noteParams.forEach(params => insertNote.run(params));
                insertSearchDoc.run(mapped.searchDocParams);
            }
        }

        insertMetadata.run({ key: 'entriesCount', value: entriesCount.toString() });
        insertMetadata.run({ key: 'databaseVersion', value: '1' });
    });

    try {
        insertEntries();
    } finally {
        db.close();
    }

    assertGeneratedDatabaseIsReadable(outDbPath);
}

if (process.argv[1] && process.argv[1].endsWith('build-sqlite.mjs')) {
    const args = process.argv.slice(2);
    let handoff = 'docs/agent-handoff/extracted';
    let out = 'tools/dictionary-pipeline/output/dictionary.db';

    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--handoff') handoff = args[++i];
        if (args[i] === '--out') out = args[++i];
    }

    try {
        buildSqlite(handoff, out);
        console.log(`[DB_OK] Created ${out}`);
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }
}
