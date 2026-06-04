import { readFile } from "node:fs/promises";

import { readJson } from "../io/read-json.mjs";
import { writeJsonlAtomic } from "../io/write-jsonl-atomic.mjs";

const grammarRulesPath = "tools/dictionary-pipeline/intermediate/appendix/grammar_rules.jsonl";
const needsReviewPath = "tools/dictionary-pipeline/intermediate/review/needs_review.jsonl";

const grammarPages = [326, 327];

export async function parseGrammarRules() {
  const rules = [];
  const reviews = [];

  for (const pageNumber of grammarPages) {
    const page = await readJson(`tools/dictionary-pipeline/intermediate/pages/page_${String(pageNumber).padStart(4, "0")}.json`);
    const contentBlocks = page.blocks.filter((block) => block.block_type !== "page_number");
    const groups = groupRuleBlocks(contentBlocks);

    groups.forEach((group, index) => {
      const examples = group.blocks.filter((block) => isExampleBlock(block.text)).map((block) => ({
        raw_text: block.text,
        source_blocks: [block.block_id],
      }));
      const ruleBlocks = group.blocks.filter((block) => !isHeadingBlock(block) && !isExampleBlock(block.text));
      const rawText = group.blocks.map((block) => block.text).join("\n");
      const ruleText = ruleBlocks.map((block) => block.text).join("\n").trim();
      const needsReview = ruleBlocks.length === 0 || group.blocks.some((block) => isContinuationOnly(block));
      const rule = {
        object_type: "grammar_rule",
        uid: `grammar-rule-p${String(pageNumber).padStart(4, "0")}-${String(index + 1).padStart(2, "0")}`,
        section: "grammar_rules",
        heading: group.heading,
        rule_text: ruleText || rawText,
        examples,
        source_page: pageNumber,
        source_blocks: group.blocks.map((block) => block.block_id),
        raw_text: rawText,
        verification_status: needsReview ? "needs_review" : "parsed",
        extraction_confidence: needsReview ? 0.6 : 0.86,
      };

      rules.push(rule);

      if (needsReview) {
        reviews.push({
          object_type: "review_item",
          uid: `review-${rule.uid}`,
          source_page: pageNumber,
          source_blocks: rule.source_blocks,
          raw_text: rawText,
          reason: "Grammar rule has continuation text or uncertain boundaries.",
          suggested_resolution: "Review grammar rule boundaries against source PDF.",
          blocking: false,
          verification_status: "needs_review",
        });
      }
    });
  }

  await writeJsonlAtomic(grammarRulesPath, rules);
  await writeJsonlAtomic(needsReviewPath, await mergeReviewItems(reviews));
  return rules;
}

function groupRuleBlocks(blocks) {
  const groups = [];
  let current = null;

  for (const block of blocks) {
    if (isHeadingBlock(block)) {
      if (current) groups.push(current);
      current = { heading: block.text, blocks: [block] };
      continue;
    }

    if (!current) {
      current = { heading: "OTHER NOTES & GRAMMAR RULES / OTRAS NOTAS Y REGLAS GRAMÁTICAS", blocks: [] };
    }

    current.blocks.push(block);
  }

  if (current) groups.push(current);
  return groups.filter((group) => group.blocks.some((block) => !isHeadingBlock(block)));
}

function isHeadingBlock(block) {
  if (block.block_type === "appendix_heading") return true;
  return /^(Adjectives\s*\/|kku\s*\/\s*ku|Onomatopoeia\s*\/|Plural\s*(?:-|–|—)|F uture,)/i.test(block.text);
}

function isExampleBlock(text) {
  return /(?:Example|Ejemplo|Ex\/Ej|\(Ex\/Ej)/i.test(text);
}

function isContinuationOnly(block) {
  return block.text.length > 0 && /^[a-záéíóúñüâîû]/i.test(block.text) && block.bbox?.x > 45 && !/[.:;)]$/.test(block.text.trim());
}

async function mergeReviewItems(newItems) {
  const existing = [];
  try {
    const text = await readFile(needsReviewPath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      if (line.trim()) existing.push(JSON.parse(line));
    }
  } catch {
  }

  const byUid = new Map(existing.map((item) => [item.uid, item]));
  for (const item of newItems) byUid.set(item.uid, item);
  return [...byUid.values()].sort((a, b) => a.uid.localeCompare(b.uid));
}
