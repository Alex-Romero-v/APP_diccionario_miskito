import fs from 'node:fs';
import Database from 'better-sqlite3';

const REQUIRED_TABLES = [
    'entries',
    'translations',
    'variants',
    'examples',
    'notes',
    'references',
    'entry_references',
    'metadata',
    'phrases',
    'search_index',
    'favorites',
    'history'
];

const args = process.argv.slice(2);
let dbPath = null;
let expectedEntries = 6386;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--db') dbPath = args[++i];
    if (args[i] === '--entries') expectedEntries = parseInt(args[++i], 10);
}

function fail(message) {
    console.error(message);
    process.exit(1);
}

if (!dbPath) {
    fail('Missing --db argument');
}

if (!fs.existsSync(dbPath)) {
    fail(`Database not found at ${dbPath}`);
}

let db;
try {
    db = new Database(dbPath, { readonly: true });
} catch (e) {
    fail(`Could not open database: ${e.message}`);
}

try {
    const integrity = db.pragma('integrity_check');
    const integrityOk = integrity.length === 1 && integrity[0].integrity_check === 'ok';
    if (!integrityOk) {
        fail(`PRAGMA integrity_check failed: ${JSON.stringify(integrity)}`);
    }

    const tables = new Set(
        db.prepare("SELECT name FROM sqlite_master WHERE type IN ('table', 'view')").all().map(row => row.name)
    );
    const missingTables = REQUIRED_TABLES.filter(table => !tables.has(table));
    if (missingTables.length) {
        fail(`Missing required tables: ${missingTables.join(', ')}`);
    }

    const metadataEntries = db.prepare("SELECT value FROM metadata WHERE key='entriesCount'").get()?.value;
    const realEntries = db.prepare('SELECT COUNT(*) AS c FROM entries').get()?.c;
    const searchRows = db.prepare('SELECT COUNT(*) AS c FROM search_index').get()?.c;

    if (parseInt(metadataEntries, 10) !== expectedEntries || realEntries !== expectedEntries) {
        fail(`Mismatch entries! expected=${expectedEntries}, db_entries=${realEntries}, metadata=${metadataEntries}`);
    }

    if (searchRows !== expectedEntries) {
        fail(`Mismatch search_index rows! expected=${expectedEntries}, search_index=${searchRows}`);
    }

    console.log(`[VALID] Database ${dbPath} has ${realEntries} entries and passes integrity/schema checks.`);
} catch (e) {
    fail(`SQLite validation failed: ${e.message}`);
} finally {
    db.close();
}
