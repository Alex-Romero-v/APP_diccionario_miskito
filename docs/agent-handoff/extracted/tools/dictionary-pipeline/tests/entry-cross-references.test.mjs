import assert from "node:assert/strict";
import test from "node:test";

import { parseEntryCrossReferences } from "../src/parse/parse-entry-cross-references.mjs";

test("parseEntryCrossReferences extracts internal references", () => {
  const refs = parseEntryCrossReferences("Ahkia? – When? (See also/ Ver también: Ahkia piua ra?)");

  assert.equal(refs.length, 1);
  assert.equal(refs[0].type, "see_also");
  assert.equal(refs[0].target_text, "Ahkia piua ra?");
  assert.equal(refs[0].resolution_status, "unresolved");
});
