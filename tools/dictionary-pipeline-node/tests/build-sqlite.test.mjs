import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';
import { buildSqlite } from '../scripts/build-sqlite.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test('buildSqlite generates DB with correct tables and entries from JSONL', () => {
    const fixtureDir = path.join(__dirname, 'fixtures');
    const outDbPath = path.join(__dirname, 'fixtures', 'test.db');
    
    if (fs.existsSync(outDbPath)) {
        fs.unlinkSync(outDbPath);
    }

    try {
        buildSqlite(fixtureDir, outDbPath);
    } catch (e) {
        assert.fail(`buildSqlite threw an error: ${e.message}`);
    }

    assert.ok(fs.existsSync(outDbPath), 'Database file should be created');

    const db = new Database(outDbPath);
    const entriesCount = db.prepare('SELECT COUNT(*) as c FROM entries').get().c;
    assert.strictEqual(entriesCount, 1, 'Should have exactly 1 entry');

    db.close();
    fs.unlinkSync(outDbPath);
});
