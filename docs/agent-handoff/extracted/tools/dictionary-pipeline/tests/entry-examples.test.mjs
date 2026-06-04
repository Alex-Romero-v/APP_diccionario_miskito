import assert from "node:assert/strict";
import test from "node:test";

import { parseEntryExamples } from "../src/parse/parse-entry-examples.mjs";

test("parseEntryExamples extracts example text and raw references", () => {
  const examples = parseEntryExamples("(Ex/Ej(hf-14): Mayam ra wis – Tell them / Dígales)", ["b1"]);

  assert.equal(examples.length, 1);
  assert.equal(examples[0].raw_reference_text, "hf-14");
  assert.equal(examples[0].miskito_text, "Mayam ra wis");
  assert.equal(examples[0].english_text, "Tell them");
  assert.equal(examples[0].spanish_text, "Dígales");
  assert.deepEqual(examples[0].source_blocks, ["b1"]);
});
