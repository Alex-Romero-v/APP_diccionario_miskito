import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import test from "node:test";

import { parseReferences } from "../src/parse/parse-references.mjs";

const referencesPath = "tools/dictionary-pipeline/intermediate/catalog/references.jsonl";

test("parseReferences reads pages 6 and 7 and writes valid JSONL", async () => {
  await rm(referencesPath, { force: true });
  const references = await parseReferences();

  assert.equal(existsSync(referencesPath), true);
  assert.ok(references.length > 20);

  const lines = (await readFile(referencesPath, "utf8")).trimEnd().split("\n");
  assert.equal(lines.length, references.length);

  for (const line of lines) {
    const reference = JSON.parse(line);
    assert.equal(reference.object_type, "reference");
    assert.equal(typeof reference.uid, "string");
    assert.equal(typeof reference.code, "string");
    assert.equal(typeof reference.raw_text, "string");
    assert.ok([6, 7].includes(reference.source_page));
    assert.ok(Array.isArray(reference.source_blocks));
    assert.ok(reference.source_blocks.length > 0);
    assert.equal(reference.verification_status, "parsed");
    assert.equal(typeof reference.extraction_confidence, "number");
  }
});

test("parseReferences detects code dash records and allows digits and underscores", async () => {
  const references = await parseReferences();
  const codes = new Set(references.map((reference) => reference.code));

  for (const code of ["aem", "rsg14", "t_", "db", "dbta"]) {
    assert.equal(codes.has(code), true, code);
  }
});

test("parseReferences joins continuation lines until the next code", async () => {
  const references = await parseReferences();
  const btq = references.find((reference) => reference.code === "btq");
  const db = references.find((reference) => reference.code === "db");

  assert.ok(btq.raw_text.includes("Bearing Thorough Witness"));
  assert.ok(btq.source_blocks.includes("p0006-b0009"));
  assert.ok(db.raw_text.includes("This is the printed Bible"));
  assert.ok(db.raw_text.includes("Esta es la Biblia"));
  assert.ok(db.source_blocks.includes("p0007-b0016"));
});

test("parseReferences preserves long bilingual raw text without splitting before new code", async () => {
  const references = await parseReferences();
  const dba = references.find((reference) => reference.code === "dba");

  assert.ok(dba.raw_text.includes("This appears to have been made after dbta"));
  assert.ok(dba.raw_text.includes("Esto parece haberse realizado"));
  assert.ok(dba.raw_text.includes("Testamento en 1905"));
});
