import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import Database from 'better-sqlite3';

function normalizeText(text) {
    if (!text) return '';
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function mapEntryToParams(entry, id) {
    const entryParams = {
        id,
        headword: entry.headword || '',
        normalized_headword: normalizeText(entry.headword || ''),
        sort_key: normalizeText(entry.headword || ''),
        entry_type: entry.entry_type || 'word',
        parent_entry_id: null,
        part_of_speech: null,
        raw_part_of_speech: null,
        source_page: entry.source?.page || null,
        raw_text: entry.raw_text || '',
        verification_status: entry.review_state || 'approved',
        extraction_confidence: (entry.confidence?.overall || 1.0).toString(),
        has_examples: (entry.examples && entry.examples.length > 0) ? 1 : 0,
        has_notes: (entry.notes && entry.notes.length > 0) ? 1 : 0,
        has_variants: (entry.variant_forms && entry.variant_forms.length > 0) ? 1 : 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    let transNorms = [];
    let translationParams = [];
    let order = 0;
    for (const t of (entry.translations || [])) {
        translationParams.push({
            entry_id: id,
            spanish_text: t.spanish || null,
            english_text: t.english || null,
            translation_order: order++,
            is_literal: t.is_literal ? 1 : 0,
            note: null
        });
        if (t.english) transNorms.push(normalizeText(t.english));
        if (t.spanish) transNorms.push(normalizeText(t.spanish));
    }

    let varNorms = [];
    let variantParams = [];
    for (const v of (entry.variant_forms || [])) {
        variantParams.push({
            entry_id: id,
            variant_text: v.text || '',
            normalized_variant: normalizeText(v.text || ''),
            variant_type: v.type || 'spelling',
            note: null
        });
        varNorms.push(normalizeText(v.text));
    }

    let exNorms = [];
    let exampleParams = [];
    let exOrder = 0;
    for (const x of (entry.examples || [])) {
        exampleParams.push({
            entry_id: id,
            miskito_text: x.miskito || '',
            spanish_text: x.spanish || null,
            english_text: x.english || null,
            source_code: null,
            source_detail: null,
            example_order: exOrder++,
            is_literal_translation: x.translation_is_literal ? 1 : 0
        });
        if (x.miskito) exNorms.push(normalizeText(x.miskito));
        if (x.english) exNorms.push(normalizeText(x.english));
        if (x.spanish) exNorms.push(normalizeText(x.spanish));
    }

    let noteNorms = [];
    let noteParams = [];
    let noteOrder = 0;
    for (const n of (entry.notes || [])) {
        noteParams.push({
            entry_id: id,
            note_type: n.type || 'grammar',
            note_text: n.text || '',
            note_order: noteOrder++
        });
        noteNorms.push(normalizeText(n.text));
    }

    const searchDocParams = {
        entry_id: id,
        headword: entry.headword || '',
        normalized_headword: normalizeText(entry.headword || ''),
        variants_text: varNorms.join(' '),
        spanish_text: ((entry.translations || []).map(t => t.spanish).filter(Boolean).join(' ') + " " + (entry.segments?.definition_segment || '')).trim(),
        english_text: ((entry.translations || []).map(t => t.english).filter(Boolean).join(' ') + " " + (entry.raw_text || '')).trim(),
        examples_text: exNorms.join(' '),
        notes_text: noteNorms.join(' ')
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

export function buildSqlite(handoffDir, outDbPath) {
    const db = new Database(outDbPath);

    db.exec(`
        CREATE TABLE IF NOT EXISTS metadata(key TEXT NOT NULL PRIMARY KEY, value TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS entries(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, headword TEXT NOT NULL, normalized_headword TEXT NOT NULL, sort_key TEXT NOT NULL, entry_type TEXT NOT NULL, parent_entry_id INTEGER, part_of_speech TEXT, raw_part_of_speech TEXT, source_page INTEGER, raw_text TEXT NOT NULL, verification_status TEXT NOT NULL, extraction_confidence TEXT NOT NULL, has_examples INTEGER NOT NULL, has_notes INTEGER NOT NULL, has_variants INTEGER NOT NULL, created_at TEXT NOT NULL, updated_at TEXT);
        CREATE TABLE IF NOT EXISTS translations(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, entry_id INTEGER NOT NULL, spanish_text TEXT, english_text TEXT, translation_order INTEGER NOT NULL, is_literal INTEGER NOT NULL, note TEXT, FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE);
        CREATE INDEX IF NOT EXISTS \`index_translations_entry_id\` ON \`translations\` (\`entry_id\`);
        CREATE TABLE IF NOT EXISTS variants(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, entry_id INTEGER NOT NULL, variant_text TEXT NOT NULL, normalized_variant TEXT NOT NULL, variant_type TEXT NOT NULL, note TEXT, FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE);
        CREATE INDEX IF NOT EXISTS \`index_variants_entry_id\` ON \`variants\` (\`entry_id\`);
        CREATE TABLE IF NOT EXISTS examples(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, entry_id INTEGER NOT NULL, miskito_text TEXT NOT NULL, spanish_text TEXT, english_text TEXT, source_code TEXT, source_detail TEXT, example_order INTEGER NOT NULL, is_literal_translation INTEGER NOT NULL, FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE);
        CREATE INDEX IF NOT EXISTS \`index_examples_entry_id\` ON \`examples\` (\`entry_id\`);
        CREATE TABLE IF NOT EXISTS notes(id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT, entry_id INTEGER NOT NULL, note_type TEXT NOT NULL, note_text TEXT NOT NULL, note_order INTEGER NOT NULL, FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE);
        CREATE INDEX IF NOT EXISTS \`index_notes_entry_id\` ON \`notes\` (\`entry_id\`);
        CREATE VIRTUAL TABLE IF NOT EXISTS search_index USING FTS4(entry_id INTEGER, headword TEXT, normalized_headword TEXT, variants_text TEXT, spanish_text TEXT, english_text TEXT, examples_text TEXT, notes_text TEXT);
        CREATE TABLE IF NOT EXISTS favorites(entry_id INTEGER NOT NULL PRIMARY KEY, created_at TEXT NOT NULL, FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE);
        CREATE TABLE IF NOT EXISTS history(entry_id INTEGER NOT NULL PRIMARY KEY, last_opened_at TEXT NOT NULL, open_count INTEGER NOT NULL, FOREIGN KEY(entry_id) REFERENCES entries(id) ON DELETE CASCADE);
    `);

    db.prepare('DELETE FROM metadata').run();
    db.prepare('DELETE FROM entries').run();
    db.prepare('DELETE FROM translations').run();
    db.prepare('DELETE FROM variants').run();
    db.prepare('DELETE FROM examples').run();
    db.prepare('DELETE FROM notes').run();
    db.prepare('DELETE FROM search_index').run();
    db.prepare('DELETE FROM favorites').run();
    db.prepare('DELETE FROM history').run();

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

    const files = fs.readdirSync(entriesDir).filter(f => f.endsWith('.jsonl'));
    let entriesCount = 0;

    db.exec('BEGIN TRANSACTION');

    try {
        for (const file of files) {
            const filePath = path.join(entriesDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split('\n');
            for (const line of lines) {
                if (!line.trim()) continue;
                const entry = JSON.parse(line);
                const uid = entry.uid;

                entriesCount++;
                const mapped = mapEntryToParams(entry, entriesCount);
                insertEntry.run(mapped.entryParams);
                mapped.translationParams.forEach(p => insertTranslation.run(p));
                mapped.variantParams.forEach(p => insertVariant.run(p));
                mapped.exampleParams.forEach(p => insertExample.run(p));
                mapped.noteParams.forEach(p => insertNote.run(p));
                insertSearchDoc.run(mapped.searchDocParams);
            }
        }

        // Insert metadata
        insertMetadata.run({ key: 'entriesCount', value: entriesCount.toString() });
        insertMetadata.run({ key: 'databaseVersion', value: '1' }); // Minimal version

        db.exec('COMMIT');
    } catch (e) {
        db.exec('ROLLBACK');
        throw e;
    } finally {
        db.close();
    }
}

if (process.argv[1] && process.argv[1].endsWith('build-sqlite.mjs')) {
    const args = process.argv.slice(2);
    let handoff = 'docs/agent-handoff/extracted';
    let out = 'tools/dictionary-pipeline/output/dictionary.db';
    
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--handoff') handoff = args[++i];
        if (args[i] === '--out') out = args[++i];
    }
    
    const outDir = path.dirname(out);
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }

    try {
        buildSqlite(handoff, out);
        console.log(`[DB_OK] Created ${out}`);
    } catch (e) {
        console.error(e.message);
        process.exit(1);
    }
}
