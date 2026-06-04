import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import test from "node:test";

import { extractPages } from "../src/parse/extract-pages.mjs";

const pagesDir = "tools/dictionary-pipeline/intermediate/pages";

test("extractPages writes 330 page JSON files with required fields", async () => {
  await extractPages();

  const files = (await readdir(pagesDir)).filter((file) => /^page_\d{4}\.json$/.test(file)).sort();
  assert.equal(files.length, 330);
  assert.equal(files[0], "page_0001.json");
  assert.equal(files.at(-1), "page_0330.json");

  const first = JSON.parse(await readFile(`${pagesDir}/page_0001.json`, "utf8"));
  const eighth = JSON.parse(await readFile(`${pagesDir}/page_0008.json`, "utf8"));
  const last = JSON.parse(await readFile(`${pagesDir}/page_0330.json`, "utf8"));

  for (const page of [first, eighth, last]) {
    assert.equal(page.object_type, "page");
    assert.equal(page.uid, `page-p${String(page.pdf_page_number).padStart(4, "0")}`);
    assert.match(page.raw_text_sha256, /^[a-f0-9]{64}$/);
    assert.ok(Array.isArray(page.blocks));
    assert.notEqual(page.verification_status, "verified");
    for (const block of page.blocks) {
      assert.equal(block.page_number, page.pdf_page_number);
      assert.equal(typeof block.block_id, "string");
      assert.equal(typeof block.text, "string");
      assert.equal(typeof block.reading_order, "number");
    }
  }

  assert.equal(first.section, "cover");
  assert.ok(first.visual_elements.length > 0);
  assert.ok(eighth.visual_elements.some((visual) => visual.visual_type === "table"));
  assert.equal(existsSync("tools/dictionary-pipeline/intermediate/review/needs_review.jsonl"), true);
  assert.equal(existsSync("tools/dictionary-pipeline/intermediate/review/rejected_blocks.jsonl"), true);
  assert.equal(existsSync("tools/dictionary-pipeline/intermediate/review/coverage_gaps.jsonl"), true);
});
