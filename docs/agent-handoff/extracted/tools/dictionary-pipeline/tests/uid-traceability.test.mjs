import assert from "node:assert/strict";
import test from "node:test";

import { validateUids } from "../src/validate/validate-uids.mjs";
import { validateTraceability } from "../src/validate/validate-traceability.mjs";

test("validateUids rejects duplicates, invalid patterns, timestamps, and random UUIDs", () => {
  const result = validateUids([
    { uid: "entry-p0001-001", path: "entries/a.jsonl" },
    { uid: "entry-p0001-001", path: "entries/b.jsonl" },
    { uid: "bad uid", path: "bad.jsonl" },
    { uid: "entry-2026-06-03T10:00:00Z", path: "time.jsonl" },
    { uid: "550e8400-e29b-41d4-a716-446655440000", path: "uuid.jsonl" },
  ]);

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("duplicate") && error.includes("entry-p0001-001")));
  assert.ok(result.errors.some((error) => error.includes("invalid UID") && error.includes("bad.jsonl")));
  assert.ok(result.errors.some((error) => error.includes("timestamp")));
  assert.ok(result.errors.some((error) => error.includes("UUID")));
});

test("validateTraceability rejects missing pages, blocks, wrong-page blocks, and unlisted derived objects", () => {
  const page = {
    uid: "page-p0001",
    pdf_page_number: 1,
    blocks: [{ block_id: "p0001-b0001", page_number: 1 }],
    derived_objects: ["entry-p0001-001"],
  };

  const result = validateTraceability({
    pages: [page],
    derivedObjects: [
      { uid: "entry-p0001-001", source_page: 1, source_blocks: ["p0001-b0001"], path: "ok.jsonl" },
      { uid: "entry-p0002-001", source_page: 2, source_blocks: ["p0002-b0001"], path: "missing-page.jsonl" },
      { uid: "entry-p0001-002", source_page: 1, source_blocks: ["p0001-b9999"], path: "missing-block.jsonl" },
      { uid: "entry-p0001-003", source_page: 1, source_blocks: ["p0002-b0001"], path: "wrong-page.jsonl" },
      { uid: "entry-p0001-004", source_page: 1, source_blocks: ["p0001-b0001"], path: "unlisted.jsonl" },
    ],
    reviewObjects: [
      { uid: "review-p0001-b9999", source_page: 1, source_blocks: ["p0001-b9999"], path: "review.jsonl" },
    ],
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("missing-page.jsonl")));
  assert.ok(result.errors.some((error) => error.includes("missing-block.jsonl")));
  assert.ok(result.errors.some((error) => error.includes("wrong-page.jsonl")));
  assert.ok(result.errors.some((error) => error.includes("unlisted.jsonl")));
  assert.ok(result.errors.some((error) => error.includes("review.jsonl")));
});
