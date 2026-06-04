import fs from 'node:fs';
import Database from 'better-sqlite3';

const dbPath = 'app/src/main/assets/dictionary.db';
const db = new Database(dbPath);

console.log("Testing search for: ba");
let q1 = '"ba*"';
const res1 = db.prepare('SELECT entry_id, headword FROM search_index WHERE search_index MATCH ? OR search_index MATCH ? LIMIT 5').all(q1, q1);
console.log(res1);

console.log("Testing search for: ba* without quotes");
let q2 = 'ba*';
const res2 = db.prepare('SELECT entry_id, headword FROM search_index WHERE search_index MATCH ? OR search_index MATCH ? LIMIT 5').all(q2, q2);
console.log(res2);
