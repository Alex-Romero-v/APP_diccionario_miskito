import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import test from "node:test";

import { parseBibleBooks } from "../src/parse/parse-bible-books.mjs";

const bibleBooksPath = "tools/dictionary-pipeline/intermediate/catalog/bible_books.jsonl";

test("parseBibleBooks writes valid rows from pages 8 and 9", async () => {
  await rm(bibleBooksPath, { force: true });
  const rows = await parseBibleBooks();

  assert.equal(existsSync(bibleBooksPath), true);
  assert.ok(rows.length >= 66);

  const lines = (await readFile(bibleBooksPath, "utf8")).trimEnd().split("\n");
  assert.equal(lines.length, rows.length);

  for (const line of lines) {
    const row = JSON.parse(line);
    assert.equal(row.object_type, "bible_book");
    assert.equal(typeof row.uid, "string");
    assert.equal(typeof row.miskito, "string");
    assert.equal(typeof row.short_code, "string");
    assert.equal(typeof row.english, "string");
    assert.equal(typeof row.spanish, "string");
    assert.ok([8, 9].includes(row.source_page));
    assert.ok(Array.isArray(row.source_blocks));
    assert.equal(row.verification_status, "parsed");
    assert.equal(typeof row.extraction_confidence, "number");
  }
});

test("parseBibleBooks marks page sections", async () => {
  const rows = await parseBibleBooks();

  assert.ok(rows.some((row) => row.section === "hebrew_scriptures" && row.source_page === 8));
  assert.ok(rows.some((row) => row.section === "greek_scriptures" && row.source_page === 9));
});

test("parseBibleBooks preserves split rows", async () => {
  const rows = await parseBibleBooks();
  const song = rows.find((row) => row.short_code === "Yam.L.");

  assert.equal(song.english, "Song of Solomon");
  assert.equal(song.spanish, "El Cantar de los Cantares");
  assert.ok(song.source_blocks.includes("p0008-b0027"));
});

test("parseBibleBooks creates deterministic UIDs", async () => {
  const rows = await parseBibleBooks();

  assert.ok(rows.some((row) => row.uid === "bible-book-p0008-blasi-sturka"));
  assert.ok(rows.some((row) => row.uid === "bible-book-p0009-matiu"));
});
