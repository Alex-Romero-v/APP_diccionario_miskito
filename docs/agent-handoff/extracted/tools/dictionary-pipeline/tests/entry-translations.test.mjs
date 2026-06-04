import assert from "node:assert/strict";
import test from "node:test";

import { parseEntryTranslations } from "../src/parse/parse-entry-translations.mjs";

test("parseEntryTranslations splits bilingual definitions after the dash", () => {
  const result = parseEntryTranslations("Abakaia (v) – to overturn, to capsize / volcar, naufragar");

  assert.equal(result.needs_review, false);
  assert.deepEqual(result.translations, [{
    english_text: "to overturn, to capsize",
    spanish_text: "volcar, naufragar",
    translation_order: 1,
    is_literal: false,
    note: null,
    raw_text: "to overturn, to capsize / volcar, naufragar",
  }]);
});

test("parseEntryTranslations ignores slashes before the definition segment", () => {
  const result = parseEntryTranslations("Adar (a/t: Ada / Arder) (n/s) – order / orden");

  assert.equal(result.translations[0].english_text, "order");
  assert.equal(result.translations[0].spanish_text, "orden");
});

test("parseEntryTranslations preserves doubtful definitions", () => {
  const result = parseEntryTranslations("Ahkia? – When?");

  assert.equal(result.needs_review, true);
  assert.equal(result.translations[0].english_text, null);
  assert.equal(result.translations[0].spanish_text, null);
  assert.equal(result.translations[0].raw_text, "When?");
});

test("parseEntryTranslations does not complete missing translations", () => {
  const result = parseEntryTranslations("X – / solo español");

  assert.equal(result.translations[0].english_text, null);
  assert.equal(result.translations[0].spanish_text, "solo español");
});
