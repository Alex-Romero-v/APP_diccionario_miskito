import assert from "node:assert/strict";
import test from "node:test";

import { validateReviewItemShape, validateReviewState } from "../src/validate/validate-review-state.mjs";

const review = {
  object_type: "review_item",
  uid: "review-p0010-b0001",
  source_page: 10,
  source_blocks: ["p0010-b0001"],
  raw_text: "???",
  reason: "Unclassified block.",
  suggested_resolution: "Review against source PDF.",
  blocking: true,
  verification_status: "needs_review",
};

test("review items require all traceability fields", () => {
  assert.deepEqual(validateReviewItemShape(review), { ok: true });
  const validation = validateReviewItemShape({ uid: "review-p0010-b0001" });
  assert.equal(validation.ok, false);
  assert.match(validation.errors.join("\n"), /raw_text/);
});

test("blocking reviews prevent final closure", () => {
  const validation = validateReviewState({ needsReview: [review], coverageGaps: [] });

  assert.equal(validation.ok, false);
  assert.match(validation.errors.join("\n"), /BLOCKING_REVIEW_EXISTS/);
});

test("blocking coverage gaps prevent final closure", () => {
  const validation = validateReviewState({ needsReview: [], coverageGaps: [review] });

  assert.equal(validation.ok, false);
  assert.match(validation.errors.join("\n"), /COVERAGE_GAP/);
});
