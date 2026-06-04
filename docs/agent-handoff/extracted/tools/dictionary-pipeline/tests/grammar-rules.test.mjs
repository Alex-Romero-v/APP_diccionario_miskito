import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import test from "node:test";

import { parseGrammarRules } from "../src/parse/parse-grammar-rules.mjs";

const grammarRulesPath = "tools/dictionary-pipeline/intermediate/appendix/grammar_rules.jsonl";

test("parseGrammarRules writes reconstructible grammar rules", async () => {
  await rm(grammarRulesPath, { force: true });
  const rules = await parseGrammarRules();

  assert.equal(existsSync(grammarRulesPath), true);
  assert.ok(rules.length > 0);

  const lines = (await readFile(grammarRulesPath, "utf8")).trimEnd().split("\n");
  assert.equal(lines.length, rules.length);

  for (const line of lines) {
    const rule = JSON.parse(line);
    for (const field of [
      "object_type",
      "uid",
      "section",
      "heading",
      "rule_text",
      "examples",
      "source_page",
      "source_blocks",
      "raw_text",
      "verification_status",
      "extraction_confidence",
    ]) {
      assert.ok(field in rule, field);
    }
    assert.equal(rule.object_type, "grammar_rule");
    assert.ok(rule.source_page >= 326 && rule.source_page <= 327);
    assert.ok(Array.isArray(rule.source_blocks));
    assert.ok(rule.source_blocks.length > 0);
    assert.ok(rule.rule_text.length > 0);
    for (const line of rule.rule_text.split("\n").filter(Boolean)) {
      assert.equal(rule.raw_text.includes(line), true);
    }
  }
});

test("parseGrammarRules preserves headings, examples, and review state", async () => {
  const rules = await parseGrammarRules();
  const adjective = rules.find((rule) => /Adjectives/.test(rule.heading));
  const withExamples = rules.find((rule) => rule.examples.length > 0);
  const needsReview = rules.find((rule) => rule.verification_status === "needs_review");

  assert.ok(adjective);
  assert.match(adjective.rule_text, /follow the noun/);
  assert.ok(withExamples);
  assert.ok(withExamples.examples.every((example) => typeof example.raw_text === "string"));
  assert.ok(needsReview);
});
