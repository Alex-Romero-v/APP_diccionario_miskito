import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import test from "node:test";

import { parseAppendix } from "../src/parse/parse-appendix.mjs";

const sectionsPath = "tools/dictionary-pipeline/intermediate/appendix/sections.jsonl";

test("parseAppendix writes appendix sections from pages 296 to 330", async () => {
  await rm(sectionsPath, { force: true });
  const sections = await parseAppendix();

  assert.equal(existsSync(sectionsPath), true);
  assert.ok(sections.length >= 35);

  const lines = (await readFile(sectionsPath, "utf8")).trimEnd().split("\n");
  assert.equal(lines.length, sections.length);

  for (const line of lines) {
    const section = JSON.parse(line);
    for (const field of [
      "object_type",
      "uid",
      "section",
      "heading",
      "source_page",
      "source_blocks",
      "raw_text",
      "verification_status",
      "extraction_confidence",
    ]) {
      assert.ok(field in section, field);
    }
    assert.ok(section.source_page >= 296 && section.source_page <= 330);
    assert.ok(Array.isArray(section.source_blocks));
    assert.ok(section.source_blocks.length > 0);
  }
});

test("parseAppendix preserves secondary sections and heading-priority classification", async () => {
  const sections = await parseAppendix();
  const appendix = sections.find((section) => section.source_page === 296);
  const page329 = sections.find((section) => section.source_page === 329);
  const page330 = sections.find((section) => section.source_page === 330);

  assert.equal(appendix.section, "appendix_overview");
  assert.ok(appendix.secondary_sections.length > 0);
  assert.equal(page329.section, "phrases");
  assert.equal(page330.section, "phrases");
});
