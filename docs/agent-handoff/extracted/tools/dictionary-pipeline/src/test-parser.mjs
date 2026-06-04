import assert from "node:assert/strict";
import { normalizeForSearch, parseEntryBlock, splitEntryBlocks } from "./pipeline.mjs";

const refs = new Set(["db", "dict", "dictu", "dbta", "bw", "hf"]);

assert.equal(normalizeForSearch("BÎLA"), "bila");
assert.equal(normalizeForSearch(" Gâd "), "gad");
assert.equal(normalizeForSearch("ÂISA"), "aisa");
assert.equal(normalizeForSearch("bîla."), "bila.");
assert.equal(normalizeForSearch("aisa-yapti"), "aisa-yapti");

const fixtures = [
  {
    raw: "Abakaia (v) – to overturn, to capsize, to shipwreck / volcar, naufragar",
    check: (entry) => {
      assert.equal(entry.headword.display, "Abakaia");
      assert.deepEqual(entry.grammar.part_of_speech, ["v"]);
      assert.equal(entry.translations[0].english, "to overturn, to capsize, to shipwreck");
      assert.equal(entry.translations[0].spanish, "volcar, naufragar");
    },
  },
  {
    raw: "Adar (a/t: Ada, Arder) (n/s) – order, command / orden, mandato",
    check: (entry) => {
      assert.equal(entry.variants.length, 2);
      assert.equal(entry.variants[0].variant_type, "also_spelled");
    },
  },
  {
    raw: "Ai (1) – her, his, its, their / su, sus, suyo, suyos",
    check: (entry) => assert.equal(entry.headword.homograph_number, 1),
  },
  {
    raw: "Ai (2) – me, to me, self, myself / yo, a mí, yo mismo (Note/Nota: Ai with a verb can indicate that the object of that verb is me. / Ai con un verbo puede indicar que el objeto de ese verbo soy “yo”.)",
    check: (entry) => assert.equal(entry.notes[0].note_type, "usage"),
  },
  {
    raw: "Kunin munaia (v) – to trick / engañar (Ex/Ej: Kunin ai munram – You tricked me / Me engañaste)",
    check: (entry) => {
      assert.equal(entry.examples.length, 1);
      assert.equal(entry.examples[0].spanish, "Me engañaste");
    },
  },
  {
    raw: "Aiawaia (db,dict; Aiauaia-dictu,dict-alt) (v) – to move oneself / moverse",
    check: (entry) => assert.ok(entry.references.length >= 2),
  },
  {
    raw: "Aihwa sma!; Aihwa sma ba! – You’re amazing! / Eres increíble!",
    section: "phrases",
    check: (entry) => assert.equal(entry.entry_type, "phrase"),
  },
  {
    raw: "Dîa takisa? (short form / forma corta: Dîa taksa?) – What’s happening? / Qué esta pasando?",
    check: (entry) => assert.equal(entry.variants[0].variant_type, "short_form"),
  },
];

fixtures.forEach((fixture, index) => {
  const entry = parseEntryBlock({
    section: fixture.section || "dictionary",
    source_page: 10,
    source_page_end: 10,
    lines: [fixture.raw],
    has_blue: false,
    crosses_page_boundary: false,
  }, index + 1, refs);
  assert.equal(entry.source.raw_text, fixture.raw);
  assert.equal(entry.source.source_page, 10);
  fixture.check(entry);
});

const segmented = splitEntryBlocks([
  {
    page: 36,
    section: "dictionary",
    lines: [
      { text: "Baku(pos,adj,adv) – so, thus / así", min_x: 36, has_blue: false, spans: [1, 2] },
      { text: "(Ex/Ej: witin baku sa – he is like that / él es así)", min_x: 42, has_blue: false, spans: [3] },
      { text: "Baku bamna (a/t: Baku ba ra-db) – therefore / por lo tanto", min_x: 70, has_blue: true, spans: [4, 5] },
      { text: "Balaia(v) – to come / venir", min_x: 36, has_blue: false, spans: [6] },
    ],
  },
]);
assert.equal(segmented.length, 3);
assert.equal(segmented[1].parent_candidate_headword, "Baku");
const subEntry = parseEntryBlock(segmented[1], 2, refs);
assert.equal(subEntry.entry_type, "sub_entry");
assert.equal(subEntry.quality.verification_status, "blue_unverified");
assert.deepEqual(subEntry.source.line_span_ids, [4, 5]);

console.log("TESTS_OK");
