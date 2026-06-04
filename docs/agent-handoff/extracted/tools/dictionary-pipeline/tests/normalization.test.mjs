import assert from "node:assert/strict";
import test from "node:test";

import { normalizeHeadword } from "../src/normalize/normalize-headword.mjs";
import { normalizePhrase } from "../src/normalize/normalize-phrase.mjs";
import { normalizeText } from "../src/normalize/normalize-text.mjs";

test("normalizeText applies auxiliary search normalization without changing raw text", () => {
  const rawText = "  Bîla   Âiska  ";
  const normalized = normalizeText(rawText);

  assert.equal(rawText, "  Bîla   Âiska  ");
  assert.equal(normalized.original_text, rawText);
  assert.equal(normalized.normalized_text, "bila aiska");
});

test("normalizeText converts only normalized circumflex forms", () => {
  assert.equal(normalizeText("â ê î ô û Â Ê Î Ô Û").normalized_text, "a e i o u a e i o u");
});

test("normalizeText returns NFC normalized auxiliary text", () => {
  assert.equal(normalizeText("e\u0302").normalized_text, "e");
});

test("headword and phrase normalizers preserve canonical values", () => {
  assert.deepEqual(normalizeHeadword("  Bîla   Tara  "), {
    headword: "  Bîla   Tara  ",
    normalized_headword: "bila tara",
    sort_key: "bila tara",
  });

  assert.deepEqual(normalizePhrase("  Pain   was!  "), {
    phrase_text: "  Pain   was!  ",
    normalized_phrase: "pain was!",
  });
});
