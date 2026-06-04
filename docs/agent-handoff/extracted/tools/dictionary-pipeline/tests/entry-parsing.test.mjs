import assert from "node:assert/strict";
import test from "node:test";

import { parseDictionaryPages } from "../src/parse/parse-dictionary-pages.mjs";
import { parseEntry } from "../src/parse/parse-entry.mjs";

test("parseEntry returns a complete base dictionary entry", () => {
  const entry = parseEntry({
    block_id: "p0010-b0005",
    page_number: 10,
    text: "Abakaia (v) – to overturn, to capsize / volcar",
    block_type: "entry_candidate",
  });

  for (const field of [
    "object_type",
    "uid",
    "headword",
    "normalized_headword",
    "sort_key",
    "entry_type",
    "parent_entry_uid",
    "part_of_speech",
    "raw_part_of_speech",
    "source_page",
    "source_blocks",
    "raw_text",
    "segments",
    "verification_status",
    "extraction_confidence",
  ]) {
    assert.ok(field in entry, field);
  }

  assert.equal(entry.headword, "Abakaia");
  assert.equal(entry.raw_part_of_speech, "v");
  assert.equal(entry.segments.definition_segment, "to overturn, to capsize / volcar");
});

test("parseEntry detects variants, examples, notes, and cross references as raw segments", () => {
  const variant = parseEntry({
    block_id: "p0010-b0009",
    page_number: 10,
    text: "Adar (a/t: Ada, Arder) (n/s) – order / orden",
    block_type: "entry_candidate",
  });
  const example = parseEntry({
    block_id: "p0010-b0017",
    page_number: 10,
    text: "(Ex/Ej: Ahkia wan? – When did he go? / ¿Cuándo se fue?)",
    block_type: "example",
  });
  const crossReference = parseEntry({
    block_id: "p0010-b0016",
    page_number: 10,
    text: "Ahkia? – When? / ¿Cuándo? (See also/ Ver también: Ahkia piua ra?)",
    block_type: "entry_candidate",
  });

  assert.equal(variant.segments.variant_segment, "a/t: Ada, Arder");
  assert.equal(example.segments.example_segments.length, 1);
  assert.equal(crossReference.segments.cross_reference_segments.length, 1);
});

test("parseDictionaryPages detects page 10 entries and preserves raw text", async () => {
  const entries = await parseDictionaryPages({ pageStart: 10, pageEnd: 10 });

  assert.ok(entries.length > 10);
  assert.ok(entries.some((entry) => entry.headword === "Abakaia"));
  assert.ok(entries.every((entry) => entry.raw_text.length > 0));
});
