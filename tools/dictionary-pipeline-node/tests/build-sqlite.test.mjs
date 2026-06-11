import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
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
    const integrity = db.pragma('integrity_check');
    assert.deepStrictEqual(integrity, [{ integrity_check: 'ok' }]);

    const entriesCount = db.prepare('SELECT COUNT(*) as c FROM entries').get().c;
    assert.strictEqual(entriesCount, 1, 'Should have exactly 1 entry');

    db.close();
    fs.unlinkSync(outDbPath);
});

test('buildSqlite recreates a corrupt output file before generating DB', () => {
    const fixtureDir = path.join(__dirname, 'fixtures');
    const outDbPath = path.join(__dirname, 'fixtures', 'test-corrupt-recreate.db');

    fs.writeFileSync(outDbPath, 'not sqlite');

    buildSqlite(fixtureDir, outDbPath);

    const db = new Database(outDbPath, { readonly: true });
    assert.deepStrictEqual(db.pragma('integrity_check'), [{ integrity_check: 'ok' }]);
    assert.strictEqual(db.prepare('SELECT COUNT(*) as c FROM entries').get().c, 1);

    db.close();
    fs.unlinkSync(outDbPath);
});

test('validate-sqlite rejects corrupt database files clearly', () => {
    const corruptDbPath = path.join(__dirname, 'fixtures', 'corrupt.db');
    fs.writeFileSync(corruptDbPath, 'not sqlite');

    const result = spawnSync(
        process.execPath,
        [
            path.join(__dirname, '..', 'scripts', 'validate-sqlite.mjs'),
            '--db',
            corruptDbPath,
            '--entries',
            '1'
        ],
        { encoding: 'utf8' }
    );

    fs.unlinkSync(corruptDbPath);

    assert.notStrictEqual(result.status, 0);
    assert.match(result.stderr, /SQLite validation failed|Could not open database/);
});
