import assert from "node:assert/strict";
import test from "node:test";

import { assignCoverage } from "../src/block/assign-coverage.mjs";
import { validateCoverage } from "../src/validate/validate-coverage.mjs";

test("assignCoverage can report block-only coverage gaps for diagnostics", () => {
  const result = assignCoverage(
    {
      uid: "page-p0010",
      pdf_page_number: 10,
      raw_text: "abcdef",
      blocks: [{ block_id: "p0010-b0001", text: "abc", block_type: "entry_candidate" }],
    },
    { countPageRawText: false },
  );

  assert.deepEqual(result.coverage, { raw_chars: 6, assigned_chars: 3, unassigned_chars: 3 });
  assert.equal(result.coverage_gaps.length, 1);
  assert.equal(result.coverage_gaps[0].blocking, true);
});

test("assignCoverage counts page.raw_text as an assigned coverage category by default", () => {
  const result = assignCoverage({
    uid: "page-p0010",
    pdf_page_number: 10,
    raw_text: "abcdef",
    blocks: [{ block_id: "p0010-b0001", text: "abc", block_type: "entry_candidate" }],
  });

  assert.deepEqual(result.coverage, { raw_chars: 6, assigned_chars: 6, unassigned_chars: 0 });
  assert.equal(result.coverage_gaps.length, 0);
});

test("assignCoverage never returns negative unassigned characters", () => {
  const result = assignCoverage({
    uid: "page-p0010",
    pdf_page_number: 10,
    raw_text: "abc",
    blocks: [{ block_id: "p0010-b0001", text: "abcdef", block_type: "entry_candidate" }],
  });

  assert.deepEqual(result.coverage, { raw_chars: 3, assigned_chars: 3, unassigned_chars: 0 });
});

test("unclassified blocks create needs_review records", () => {
  const result = assignCoverage({
    uid: "page-p0010",
    pdf_page_number: 10,
    raw_text: "???",
    blocks: [{ block_id: "p0010-b0001", text: "???", block_type: "unclassified" }],
  });

  assert.equal(result.needs_review.length, 1);
  assert.equal(result.needs_review[0].source_blocks[0], "p0010-b0001");
});

test("validateCoverage enforces raw = assigned + unassigned", () => {
  assert.deepEqual(validateCoverage({ raw_chars: 5, assigned_chars: 3, unassigned_chars: 2 }), { ok: true });
  const validation = validateCoverage({ raw_chars: 5, assigned_chars: 6, unassigned_chars: 0 });
  assert.equal(validation.ok, false);
});
