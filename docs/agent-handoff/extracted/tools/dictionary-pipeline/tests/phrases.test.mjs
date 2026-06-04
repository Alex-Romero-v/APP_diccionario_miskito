import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import test from "node:test";

import { parsePhrases } from "../src/parse/parse-phrases.mjs";

const phrasesPath = "tools/dictionary-pipeline/intermediate/appendix/phrases.jsonl";

test("parsePhrases writes ordered traceable phrases", async () => {
  await rm(phrasesPath, { force: true });
  const phrases = await parsePhrases();

  assert.equal(existsSync(phrasesPath), true);
  assert.ok(phrases.length > 0);

  const lines = (await readFile(phrasesPath, "utf8")).trimEnd().split("\n");
  assert.equal(lines.length, phrases.length);

  let lastKey = "";
  for (const line of lines) {
    const phrase = JSON.parse(line);
    for (const field of [
      "phrase_text",
      "normalized_phrase",
      "english_text",
      "spanish_text",
      "category",
      "source_page",
      "source_blocks",
      "raw_text",
      "confidence",
      "verification_status",
    ]) {
      assert.ok(field in phrase, field);
    }
    assert.ok(Array.isArray(phrase.source_blocks));
    assert.ok(phrase.source_blocks.length > 0);
    const key = `${String(phrase.source_page).padStart(4, "0")}-${phrase.source_blocks[0]}`;
    assert.ok(key >= lastKey);
    lastKey = key;
  }
});

test("parsePhrases preserves diacritics, normalizes, and records uncertain separation", async () => {
  const phrases = await parsePhrases();
  const withDiacritic = phrases.find((phrase) => phrase.phrase_text.includes("Dîa"));
  const uncertain = phrases.find((phrase) => phrase.verification_status === "needs_review");

  assert.ok(withDiacritic);
  assert.notEqual(withDiacritic.phrase_text, withDiacritic.normalized_phrase);
  assert.ok(uncertain);
  assert.equal(uncertain.raw_text.length > 0, true);
});
