import { readJson } from "../io/read-json.mjs";
import { writeJsonlAtomic } from "../io/write-jsonl-atomic.mjs";
import { createUidAllocator } from "../normalize/slugify-uid.mjs";
import { validateCatalogObject } from "../schemas/catalog.schema.mjs";

const pagePath = "tools/dictionary-pipeline/intermediate/pages/page_0005.json";
const abbreviationsPath = "tools/dictionary-pipeline/intermediate/catalog/abbreviations.jsonl";

export async function parseAbbreviations() {
  const page = await readJson(pagePath);
  const allocate = createUidAllocator();

  const entries = page.blocks
    .filter((block) => isAbbreviationCandidate(block))
    .map((block) => buildAbbreviation(block, allocate))
    .filter(Boolean)
    .sort((a, b) => a.source_blocks[0].localeCompare(b.source_blocks[0], "en"));

  for (const entry of entries) {
    const validation = validateCatalogObject(entry);
    if (!validation.ok) {
      throw new Error(validation.errors.join("\n"));
    }
  }

  await writeJsonlAtomic(abbreviationsPath, entries);
  return entries;
}

function isAbbreviationCandidate(block) {
  if (block.page_number !== 5) return false;
  if (block.block_type === "page_number" || block.block_type === "appendix_heading") return false;
  if (/ABBREVIATIONS|ABREVIATURAS/i.test(block.text)) return false;
  return splitCodeAndDescription(block.text) !== null;
}

function buildAbbreviation(block, allocate) {
  const parsed = splitCodeAndDescription(block.text);
  if (!parsed) return null;

  return {
    object_type: "abbreviation",
    uid: allocate.abbreviation(5, parsed.code),
    code: parsed.code,
    english_text: parsed.description,
    spanish_text: null,
    source_page: 5,
    source_blocks: [block.block_id],
    raw_text: block.text,
    extraction_confidence: 0.95,
    verification_status: "parsed",
  };
}

function splitCodeAndDescription(text) {
  const trimmed = String(text).trim().replace(/\s+-\s+/g, "-").replace(/^fu\s+t\b/, "fut");
  const match = trimmed.match(/^([A-Za-z0-9]+(?:\/[A-Za-z0-9]+)?(?::)?(?:-[A-Za-z0-9]+(?:\/[A-Za-z0-9]+)?)?)\s+(.+)$/);
  if (!match) return null;

  return {
    code: match[1],
    description: match[2],
  };
}
