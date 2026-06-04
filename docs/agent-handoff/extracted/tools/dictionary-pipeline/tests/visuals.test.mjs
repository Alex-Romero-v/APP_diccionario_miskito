import assert from "node:assert/strict";
import test from "node:test";

import { extractPageVisuals } from "../src/pdf/extract-page-visuals.mjs";

test("extractPageVisuals records images, tables, small text, colors, and neutral unknowns", () => {
  const visuals = extractPageVisuals({
    page_number: 1,
    items: [
      { str: "tiny", x: 1, y: 1, width: 10, height: 5, fontName: "F1" },
      { str: "blue", x: 1, y: 20, width: 10, height: 12, color: "#0000ff" },
    ],
    operatorList: {
      fnArray: ["paintImageXObject"],
    },
    lines: [
      { text: "A | B | C", bbox: { x: 0, y: 0, width: 100, height: 10 } },
    ],
  });

  assert.ok(visuals.some((visual) => visual.visual_type === "image"));
  assert.ok(visuals.some((visual) => visual.visual_type === "table"));
  assert.ok(visuals.some((visual) => visual.visual_type === "small_text"));
  assert.ok(visuals.some((visual) => visual.visual_type === "colored_text"));
  assert.equal(visuals.every((visual) => visual.description.length > 0), true);
});

test("extractPageVisuals returns a neutral layout marker when no visual is identifiable", () => {
  const visuals = extractPageVisuals({ page_number: 2, items: [], lines: [] });

  assert.deepEqual(visuals, [{
    uid: "visual-p0002-unknown-0001",
    object_type: "visual_element",
    visual_type: "unknown",
    source_page: 2,
    bbox: null,
    description: "Elemento visual detectado en la página.",
    associated_text: "",
    requires_manual_review: false,
  }]);
});
