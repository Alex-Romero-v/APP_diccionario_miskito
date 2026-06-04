import assert from "node:assert/strict";
import test from "node:test";

import { validateJsonText } from "../src/validate/validate-json.mjs";
import { validateJsonlText } from "../src/validate/validate-jsonl.mjs";
import { validatePageObject } from "../src/validate/validate-pages.mjs";

test("validateJsonText reports invalid JSON with path", () => {
  const result = validateJsonText("{", "intermediate/bad.json");
  assert.equal(result.ok, false);
  assert.match(result.errors[0], /intermediate\/bad\.json/);
});

test("validateJsonlText reports invalid and empty intermediate lines", () => {
  const invalid = validateJsonlText('{"uid":"a"}\nnope\n', "items.jsonl");
  const empty = validateJsonlText('{"uid":"a"}\n\n{"uid":"b"}\n', "items.jsonl");

  assert.equal(invalid.ok, false);
  assert.match(invalid.errors[0], /items\.jsonl:2/);
  assert.equal(empty.ok, false);
  assert.match(empty.errors[0], /empty line/);
});

test("validateJsonlText permits empty review files only", () => {
  assert.equal(validateJsonlText("", "review/needs_review.jsonl", { allowEmptyReview: true }).ok, true);
  assert.equal(validateJsonlText("", "appendix/phrases.jsonl", { allowEmptyReview: true }).ok, false);
});

test("validatePageObject detects missing critical fields, invalid states, and bad types", () => {
  const result = validatePageObject({
    object_type: "page",
    uid: "page-p0001",
    pdf_page_number: "1",
    verification_status: "unknown",
  }, "pages/page_0001.json");

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("pages/page_0001.json")));
  assert.ok(result.errors.some((error) => error.includes("raw_text")));
  assert.ok(result.errors.some((error) => error.includes("pdf_page_number")));
  assert.ok(result.errors.some((error) => error.includes("verification_status")));
});
