import assert from "node:assert/strict";
import test from "node:test";

import { buildBlocks } from "../src/block/build-blocks.mjs";
import { allowedBlockTypes, classifyBlock } from "../src/block/classify-block.mjs";
import { linkContinuations } from "../src/block/link-continuations.mjs";

const line = (readingOrder, text, y = 100) => ({
  line_id: `l${readingOrder}`,
  text,
  bbox: { x: 10, y, width: 100, height: 10 },
  font_summary: {},
  color_summary: {},
  reading_order: readingOrder,
});

test("buildBlocks creates complete non-empty classified blocks", () => {
  const blocks = buildBlocks([line(1, "Abakaia (v) - to overturn / volcar")], { pageNumber: 10 });

  assert.equal(blocks.length, 1);
  for (const block of blocks) {
    assert.equal(typeof block.block_id, "string");
    assert.equal(block.page_number, 10);
    assert.equal(typeof block.text, "string");
    assert.ok(block.text.length > 0);
    assert.ok(allowedBlockTypes.has(block.block_type));
    assert.equal(typeof block.bbox, "object");
    assert.equal(typeof block.reading_order, "number");
    assert.equal(typeof block.font_summary, "object");
    assert.equal(typeof block.color_summary, "object");
    assert.equal(typeof block.confidence, "number");
  }
});

test("buildBlocks does not generate empty blocks", () => {
  assert.deepEqual(buildBlocks([line(1, "   ")], { pageNumber: 1 }), []);
});

test("classifyBlock uses the allowed block type catalog", () => {
  const samples = [
    ["1", "page_number"],
    ["A. heading", "index_item"],
    ["adj adjective / adjetivo", "abbreviation_item"],
    ["db - Dawan Bila", "reference_item"],
    ["Genesis Gn Genesis Genesis", "bible_book_row"],
    ["(Ex/Ej: text)", "example"],
    ["(Note/Nota: text)", "note"],
    ["See also/ver tambien", "cross_reference"],
    ["PHRASES, EXPRESSIONS", "appendix_heading"],
    ["A | B | C", "table_row"],
  ];

  for (const [text, expected] of samples) {
    assert.equal(classifyBlock({ text }).block_type, expected);
  }
});

test("continuation blocks can be linked", () => {
  const previous = { block_id: "p0010-b0001", block_type: "entry_candidate" };
  const next = { block_id: "p0011-b0001", block_type: "entry_continuation" };
  const [linkedPrevious, linkedNext] = linkContinuations([previous], [next]);

  assert.equal(linkedPrevious.continued_to, "p0011-b0001");
  assert.equal(linkedNext.continued_from, "p0010-b0001");
});
