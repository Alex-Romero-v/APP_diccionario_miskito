import assert from "node:assert/strict";
import test from "node:test";

import { parseEntryVariants } from "../src/parse/parse-entry-variants.mjs";

test("parseEntryVariants detects marked variants", () => {
  const variants = parseEntryVariants("Adar (a/t: Ada, Arder) (n/s) – order / orden", ["p0010-b0009"]);

  assert.deepEqual(variants.map((variant) => variant.variant_text), ["Ada", "Arder"]);
  assert.equal(variants[0].variant_type, "also_spelled");
  assert.equal(variants[0].note, "a/t:");
  assert.deepEqual(variants[0].source_blocks, ["p0010-b0009"]);
});

test("parseEntryVariants detects Alt and former spelling markers", () => {
  assert.equal(parseEntryVariants("X (Alt: Y) – text", ["b"])[0].variant_type, "alternative");
  assert.equal(parseEntryVariants("X (fs/ea: Y) – text", ["b"])[0].variant_type, "former_spelling");
});

test("parseEntryVariants detects declared construct and irregular forms", () => {
  assert.equal(parseEntryVariants("X (Construct: Y) – text", ["b"])[0].variant_type, "construct");
  assert.equal(parseEntryVariants("X (irregular: Y) – text", ["b"])[0].variant_type, "irregular");
});

test("parseEntryVariants keeps unknown parenthetical variants", () => {
  const variant = parseEntryVariants("Abdías (Abdias) – Obadiah / Abdías", ["b"])[0];

  assert.equal(variant.variant_text, "Abdias");
  assert.equal(variant.variant_type, "parenthetical");
  assert.equal(variant.normalized_variant, "abdias");
});
