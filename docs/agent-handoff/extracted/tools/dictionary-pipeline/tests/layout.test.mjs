import assert from "node:assert/strict";
import test from "node:test";

import { buildLines } from "../src/block/build-lines.mjs";
import { extractPageLayout } from "../src/pdf/extract-page-layout.mjs";

const items = [
  { str: "second", x: 10, y: 90, width: 20, height: 10, fontName: "F1" },
  { str: "line", x: 40, y: 90.4, width: 15, height: 10, fontName: "F1" },
  { str: "first", x: 10, y: 120, width: 20, height: 10, fontName: "F2" },
];

test("buildLines groups by stable vertical coordinate and sorts reading order", () => {
  const lines = buildLines(items, { pageNumber: 10 });

  assert.equal(lines.length, 2);
  assert.deepEqual(lines.map((line) => line.text), ["first", "second line"]);
  assert.deepEqual(lines.map((line) => line.reading_order), [1, 2]);
});

test("buildLines calculates bboxes and summaries", () => {
  const lines = buildLines(items, { pageNumber: 10 });
  const secondLine = lines[1];

  assert.deepEqual(secondLine.bbox, { x: 10, y: 90, width: 45, height: 10.4 });
  assert.deepEqual(secondLine.font_summary.font_names, ["F1"]);
  assert.deepEqual(secondLine.color_summary.colors, []);
});

test("extractPageLayout builds lines from extracted page text", () => {
  const layout = extractPageLayout({ page_number: 10, items });

  assert.equal(layout.page_number, 10);
  assert.equal(layout.lines.length, 2);
});
