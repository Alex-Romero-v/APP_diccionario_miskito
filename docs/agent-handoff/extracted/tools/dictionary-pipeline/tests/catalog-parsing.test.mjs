import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import test from "node:test";

import { parseAbbreviations } from "../src/parse/parse-abbreviations.mjs";

const abbreviationsPath = "tools/dictionary-pipeline/intermediate/catalog/abbreviations.jsonl";

test("parseAbbreviations reads page 0005 and writes valid abbreviation JSONL", async () => {
  await rm(abbreviationsPath, { force: true });

  const entries = await parseAbbreviations();

  assert.equal(existsSync(abbreviationsPath), true);
  assert.ok(entries.length >= 20);

  const lines = (await readFile(abbreviationsPath, "utf8")).trimEnd().split("\n");
  assert.equal(lines.length, entries.length);

  for (const line of lines) {
    const object = JSON.parse(line);
    assert.equal(object.object_type, "abbreviation");
    assert.equal(typeof object.uid, "string");
    assert.equal(typeof object.code, "string");
    assert.equal(typeof object.raw_text, "string");
    assert.equal(object.source_page, 5);
    assert.ok(Array.isArray(object.source_blocks));
    assert.equal(typeof object.verification_status, "string");
    assert.equal(typeof object.extraction_confidence, "number");
  }
});

test("parseAbbreviations detects required simple and punctuated codes", async () => {
  const entries = await parseAbbreviations();
  const codes = new Set(entries.map((entry) => entry.code));

  for (const code of ["adj", "adv", "conj", "fut", "pres", "pron"]) {
    assert.equal(codes.has(code), true, code);
  }

  for (const code of ["a/t:", "Alt:", "fs/ea:", "Lit:"]) {
    assert.equal(codes.has(code), true, code);
  }
});

test("parseAbbreviations preserves punctuation, bars, and colons", async () => {
  const entries = await parseAbbreviations();

  assert.ok(entries.find((entry) => entry.code === "fs/ea:"));
  assert.ok(entries.find((entry) => entry.code === "a/t:"));
  assert.ok(entries.find((entry) => entry.raw_text.includes("/")));
});
