import assert from "node:assert/strict";
import { readdir, readFile, rm } from "node:fs/promises";
import test from "node:test";

import { writeDictionaryPartitions } from "../src/parse/parse-dictionary-pages.mjs";

const outputDir = "tools/dictionary-pipeline/intermediate/dictionary_entries";
const expectedPartitions = [
  "entries_pages_0010_0025.jsonl",
  "entries_pages_0026_0050.jsonl",
  "entries_pages_0051_0075.jsonl",
  "entries_pages_0076_0100.jsonl",
  "entries_pages_0101_0125.jsonl",
  "entries_pages_0126_0150.jsonl",
  "entries_pages_0151_0175.jsonl",
  "entries_pages_0176_0200.jsonl",
  "entries_pages_0201_0225.jsonl",
  "entries_pages_0226_0250.jsonl",
  "entries_pages_0251_0275.jsonl",
  "entries_pages_0276_0295.jsonl",
];

test("writeDictionaryPartitions creates deterministic JSONL partitions", async () => {
  await rm(outputDir, { recursive: true, force: true });
  await writeDictionaryPartitions();

  const files = (await readdir(outputDir)).sort();
  assert.deepEqual(files, expectedPartitions);

  const seen = new Set();
  for (const file of files) {
    const text = await readFile(`${outputDir}/${file}`, "utf8");
    const lines = text.length === 0 ? [] : text.trimEnd().split("\n");
    for (const line of lines) {
      assert.notEqual(line, "");
      const entry = JSON.parse(line);
      assert.equal(typeof entry.uid, "string");
      assert.equal(seen.has(entry.uid), false);
      seen.add(entry.uid);
      assert.ok(entry.source_page >= 10 && entry.source_page <= 295);
      assert.ok(Array.isArray(entry.source_blocks));
      assert.ok(entry.source_blocks.length > 0);
    }
  }
});

test("dictionary entries are ordered by page, reading order, headword, uid", async () => {
  await writeDictionaryPartitions();
  const firstPartition = (await readFile(`${outputDir}/entries_pages_0010_0025.jsonl`, "utf8"))
    .trimEnd()
    .split("\n")
    .map((line) => JSON.parse(line));

  for (let index = 1; index < firstPartition.length; index += 1) {
    assert.ok(compareEntries(firstPartition[index - 1], firstPartition[index]) <= 0);
  }
});

function compareEntries(a, b) {
  return (
    a.source_page - b.source_page ||
    a.reading_order - b.reading_order ||
    a.headword.localeCompare(b.headword, "en") ||
    a.uid.localeCompare(b.uid, "en")
  );
}
