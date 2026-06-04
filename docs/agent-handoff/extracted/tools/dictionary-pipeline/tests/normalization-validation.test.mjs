import assert from "node:assert/strict";
import test from "node:test";

import { validateNormalization } from "../src/validate/validate-normalization.mjs";

test("validateNormalization accepts preserved canonical text and normalized auxiliary fields", () => {
  const result = validateNormalization({
    uid: "entry-p0001-001",
    raw_text: "BÃ®la   tara",
    headword: "BÃ®la",
    normalized_headword: "bila",
    phrase_text: "Dîa   krani?",
    normalized_phrase: "dia krani?",
  });

  assert.equal(result.ok, true);
});

test("validateNormalization reports canonical diacritic loss and incomplete auxiliary normalization", () => {
  const result = validateNormalization({
    uid: "entry-p0001-002",
    raw_text: "Bila tara",
    expected_raw_text: "BÃ®la tara",
    headword: "Bila",
    expected_headword: "BÃ®la",
    phrase_text: "Dia krani?",
    expected_phrase_text: "Dîa krani?",
    normalized_headword: "BÃ®la",
    normalized_phrase: "Dîa   krani?",
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("raw_text") && error.includes("entry-p0001-002")));
  assert.ok(result.errors.some((error) => error.includes("headword")));
  assert.ok(result.errors.some((error) => error.includes("phrase_text")));
  assert.ok(result.errors.some((error) => error.includes("normalized_headword")));
  assert.ok(result.errors.some((error) => error.includes("normalized_phrase")));
});

test("validateNormalization requires normalized fields to be NFC", () => {
  const result = validateNormalization({
    uid: "phrase-p0001-001",
    phrase_text: "Dîa",
    normalized_phrase: "di\u0302a",
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("NFC")));
});
