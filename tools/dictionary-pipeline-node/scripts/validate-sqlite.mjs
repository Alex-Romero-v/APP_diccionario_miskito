import path from 'node:path';
import fs from 'node:fs';
import Database from 'better-sqlite3';

const args = process.argv.slice(2);
let dbPath = null;
let expectedEntries = 6386;

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--db') dbPath = args[++i];
    if (args[i] === '--entries') expectedEntries = parseInt(args[++i], 10);
}

if (!dbPath) {
    console.error("Missing --db argument");
    process.exit(1);
}

if (!fs.existsSync(dbPath)) {
    console.error(`Database not found at ${dbPath}`);
    process.exit(1);
}

const db = new Database(dbPath, { readonly: true });
try {
    const entriesCountNum = db.prepare("SELECT value FROM metadata WHERE key='entriesCount'").get()?.value;
    const realCount = db.prepare("SELECT COUNT(*) AS c FROM entries").get()?.c;
    
    if (parseInt(entriesCountNum, 10) !== expectedEntries || realCount !== expectedEntries) {
        console.error(`Mismatch entries! expected=${expectedEntries}, db_entries=${realCount}, metadata=${entriesCountNum}`);
        process.exit(1);
    }
    console.log(`[VALID] Database ${dbPath} has ${realCount} entries.`);
    process.exit(0);
} catch (e) {
    console.error(e.message);
    process.exit(1);
} finally {
    db.close();
}
