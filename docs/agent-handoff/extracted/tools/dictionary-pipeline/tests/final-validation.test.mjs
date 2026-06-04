import assert from "node:assert/strict";
import test from "node:test";

import { validateTranscriptionState } from "../src/validate/validate-transcription.mjs";

test("validateTranscriptionState runs validations in fixed order", async () => {
  const calls = [];
  const result = await validateTranscriptionState({
    validators: makeValidators(calls),
  });

  assert.equal(result.ok, true);
  assert.deepEqual(calls, [
    "validate-env",
    "validate-manifest",
    "validate-pages",
    "validate-json",
    "validate-jsonl",
    "validate-uids",
    "validate-traceability",
    "validate-coverage",
    "validate-normalization",
    "validate-checksums",
    "validate-review-state",
  ]);
});

test("validateTranscriptionState reports blocking global failures with path and code", async () => {
  const result = await validateTranscriptionState({
    validators: {
      ...makeValidators([]),
      "validate-manifest": () => [{ code: "MISSING_MANIFEST", message: "manifest.json missing", path: "tools/dictionary-pipeline/intermediate/manifest.json" }],
      "validate-pages": () => [{ code: "MISSING_PAGE", message: "page missing", path: "tools/dictionary-pipeline/intermediate/pages/page_0001.json" }],
      "validate-json": () => [{ code: "INVALID_JSON", message: "invalid JSON", path: "bad.json" }],
      "validate-uids": () => [{ code: "DUPLICATE_UID", message: "duplicate UID", path: "entries.jsonl" }],
      "validate-traceability": () => [{ code: "TRACEABILITY_BROKEN", message: "missing block", path: "entries.jsonl" }],
      "validate-review-state": () => [
        { code: "BLOCKING_REVIEW_EXISTS", message: "blocking review", path: "needs_review.jsonl" },
        { code: "COVERAGE_GAP", message: "blocking coverage gap", path: "coverage_gaps.jsonl" },
        { code: "PAGE_BLOCKED", message: "page blocked", path: "page_0001.json" },
        { code: "PAGE_NEEDS_REVIEW", message: "page needs review", path: "page_0002.json" },
      ],
    },
  });

  assert.equal(result.ok, false);
  for (const code of [
    "MISSING_MANIFEST",
    "MISSING_PAGE",
    "INVALID_JSON",
    "DUPLICATE_UID",
    "TRACEABILITY_BROKEN",
    "BLOCKING_REVIEW_EXISTS",
    "COVERAGE_GAP",
    "PAGE_BLOCKED",
    "PAGE_NEEDS_REVIEW",
  ]) {
    assert.ok(result.errors.some((error) => error.code === code && error.path));
  }
});

test("validateTranscriptionState can reserve review blocking for final closure", async () => {
  const validators = {
    ...makeValidators([]),
    "validate-review-state": () => [{ code: "BLOCKING_REVIEW_EXISTS", message: "blocking review", path: "needs_review.jsonl" }],
  };

  const implementationPass = await validateTranscriptionState({
    validators: { ...validators, "validate-review-state": () => [] },
  });
  const finalClosureFailure = await validateTranscriptionState({ validators });

  assert.equal(implementationPass.ok, true);
  assert.equal(finalClosureFailure.ok, false);
  assert.ok(finalClosureFailure.errors.some((error) => error.code === "BLOCKING_REVIEW_EXISTS"));
});


function makeValidators(calls) {
  return Object.fromEntries([
    "validate-env",
    "validate-manifest",
    "validate-pages",
    "validate-json",
    "validate-jsonl",
    "validate-uids",
    "validate-traceability",
    "validate-coverage",
    "validate-normalization",
    "validate-checksums",
    "validate-review-state",
  ].map((name) => [name, () => {
    calls.push(name);
    return [];
  }]));
}
