import assert from "node:assert/strict";
import test from "node:test";

import { allowedSections } from "../src/config/sections.mjs";
import { classifyPageSection } from "../src/pdf/classify-page-section.mjs";

test("classifyPageSection maps fixed front matter ranges", () => {
  assert.equal(classifyPageSection({ pageNumber: 1 }).section, "cover");
  assert.equal(classifyPageSection({ pageNumber: 2 }).section, "index");
  assert.equal(classifyPageSection({ pageNumber: 3 }).section, "usage");
  assert.equal(classifyPageSection({ pageNumber: 4 }).section, "dictionary_notes");
  assert.equal(classifyPageSection({ pageNumber: 5 }).section, "abbreviations");
  assert.equal(classifyPageSection({ pageNumber: 6 }).section, "references");
  assert.equal(classifyPageSection({ pageNumber: 7 }).section, "references");
  assert.equal(classifyPageSection({ pageNumber: 8 }).section, "bible_books");
  assert.equal(classifyPageSection({ pageNumber: 9 }).section, "bible_books");
});

test("classifyPageSection maps dictionary and appendix ranges", () => {
  assert.equal(classifyPageSection({ pageNumber: 10 }).section, "dictionary");
  assert.equal(classifyPageSection({ pageNumber: 295 }).section, "dictionary");
  assert.equal(classifyPageSection({ pageNumber: 296, rawText: "APPENDIX" }).section, "appendix_overview");
  assert.equal(classifyPageSection({ pageNumber: 330, rawText: "PHRASES, EXPRESSIONS, GREETINGS" }).section, "phrases");
});

test("visible headings override broad ranges", () => {
  assert.equal(classifyPageSection({ pageNumber: 100, rawText: "VERB TABLES / TABLAS DE VERBOS" }).section, "verb_tables");
  assert.equal(classifyPageSection({ pageNumber: 20, rawText: "GRAMMAR RULES" }).section, "grammar_rules");
});

test("unknown is used when there is not enough evidence", () => {
  assert.equal(classifyPageSection({ pageNumber: 999, rawText: "" }).section, "unknown");
});

test("all returned sections are from the allowed catalog", () => {
  for (const pageNumber of [1, 2, 3, 4, 5, 6, 8, 10, 296, 330, 999]) {
    const result = classifyPageSection({ pageNumber });
    assert.equal(allowedSections.has(result.section), true);
    assert.equal(Array.isArray(result.secondary_sections), true);
  }
});
