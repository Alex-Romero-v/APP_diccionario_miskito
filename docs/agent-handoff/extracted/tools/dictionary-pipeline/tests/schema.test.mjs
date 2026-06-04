import assert from "node:assert/strict";
import test from "node:test";

import { validateAppendixObject } from "../src/schemas/appendix.schema.mjs";
import { validateCatalogObject } from "../src/schemas/catalog.schema.mjs";
import { validateDictionaryEntry } from "../src/schemas/dictionary-entry.schema.mjs";
import { validateManifestShape } from "../src/schemas/manifest.schema.mjs";
import { validatePage } from "../src/schemas/page.schema.mjs";
import { validateReviewItem } from "../src/schemas/review.schema.mjs";

const block = {
  block_id: "p0010-b0001",
  page_number: 10,
  text: "Abakaia",
  block_type: "entry_candidate",
  bbox: { x: 0, y: 0, width: 10, height: 10 },
  reading_order: 1,
  font_summary: {},
  color_summary: {},
  confidence: 1,
};

const derived = {
  object_type: "dictionary_entry",
  uid: "entry-p0010-b0001-abakaia",
  source_page: 10,
  source_blocks: ["p0010-b0001"],
  raw_text: "Abakaia",
  extraction_confidence: 1,
  verification_status: "parsed",
};

test("page schema accepts a minimal valid page", () => {
  assert.deepEqual(validatePage({
    object_type: "page",
    uid: "page-p0010",
    pdf_page_number: 10,
    printed_page_number: null,
    section: "dictionary",
    secondary_sections: [],
    raw_text: "Abakaia",
    raw_text_sha256: "a".repeat(64),
    blocks: [block],
    visual_elements: [],
    derived_objects: [derived.uid],
    coverage: { raw_chars: 7, assigned_chars: 7, unassigned_chars: 0 },
    verification_status: "parsed",
    extraction_confidence: 1,
  }), { ok: true });
});

test("page schema rejects missing critical fields with field paths", () => {
  const validation = validatePage({ object_type: "page", blocks: [{}] });

  assert.equal(validation.ok, false);
  assert.match(validation.errors.join("\n"), /uid/);
  assert.match(validation.errors.join("\n"), /blocks\.0\.block_id/);
});

test("dictionary-entry schema accepts a minimal valid entry", () => {
  assert.deepEqual(validateDictionaryEntry({
    ...derived,
    headword: "Abakaia",
    normalized_headword: "abakaia",
    sort_key: "abakaia",
    entry_type: "main",
    parent_uid: null,
    raw_part_of_speech: null,
    part_of_speech: null,
    translations: [],
    variants: [],
    examples: [],
    notes: [],
    references: [],
    cross_references: [],
    flags: { has_examples: false, has_notes: false, has_variants: false },
  }), { ok: true });
});

test("derived object schemas reject invalid verification states", () => {
  for (const validate of [validateDictionaryEntry, validateCatalogObject, validateAppendixObject, validateReviewItem]) {
    const validation = validate({ ...derived, verification_status: "done" });
    assert.equal(validation.ok, false);
    assert.match(validation.errors.join("\n"), /verification_status/);
  }
});

test("manifest schema rejects missing fields", () => {
  const errors = validateManifestShape({});
  assert.ok(errors.some((error) => error.includes("schema_version")));
});
