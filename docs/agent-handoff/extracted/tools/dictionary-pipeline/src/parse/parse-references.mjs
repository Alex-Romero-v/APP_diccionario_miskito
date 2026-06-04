import { readJson } from "../io/read-json.mjs";
import { writeJsonlAtomic } from "../io/write-jsonl-atomic.mjs";
import { createUidAllocator } from "../normalize/slugify-uid.mjs";
import { validateCatalogObject } from "../schemas/catalog.schema.mjs";

const pagePaths = [
  "tools/dictionary-pipeline/intermediate/pages/page_0006.json",
  "tools/dictionary-pipeline/intermediate/pages/page_0007.json",
];
const referencesPath = "tools/dictionary-pipeline/intermediate/catalog/references.jsonl";

export async function parseReferences() {
  const pages = await Promise.all(pagePaths.map((path) => readJson(path)));
  const allocate = createUidAllocator();
  const records = [];
  let current = null;

  for (const page of pages) {
    for (const block of page.blocks) {
      if (block.block_type === "page_number" || /REFERENCES|Referencias/i.test(block.text)) {
        continue;
      }

      const start = parseReferenceStart(block.text);
      if (start) {
        if (current) records.push(finalizeReference(current, allocate));
        current = {
          code: start.code,
          source_page: page.pdf_page_number,
          source_pages: [page.pdf_page_number],
          source_blocks: [block.block_id],
          parts: [start.text],
        };
      } else if (current) {
        current.parts.push(block.text);
        current.source_blocks.push(block.block_id);
        if (!current.source_pages.includes(page.pdf_page_number)) {
          current.source_pages.push(page.pdf_page_number);
        }
      }
    }
  }

  if (current) records.push(finalizeReference(current, allocate));

  for (const record of records) {
    const validation = validateCatalogObject(record);
    if (!validation.ok) throw new Error(validation.errors.join("\n"));
  }

  await writeJsonlAtomic(referencesPath, records);
  return records;
}

function parseReferenceStart(text) {
  const normalized = String(text).trim().replace(/^t\s+_/, "t_");
  const match = normalized.match(/^([A-Za-z0-9_]+)\s*-\s*(.+)$/);
  if (!match) return null;
  return { code: match[1], text: normalized };
}

function finalizeReference(record, allocate) {
  const rawText = record.parts.join(" ").replace(/\s+/g, " ").trim();

  return {
    object_type: "reference",
    uid: allocate.reference(record.source_page, record.code),
    code: record.code,
    short_name: "",
    full_description: rawText,
    language: "bilingual",
    reference_type: "source",
    source_page: record.source_page,
    source_pages: record.source_pages,
    source_blocks: record.source_blocks,
    raw_text: rawText,
    extraction_confidence: 0.95,
    verification_status: "parsed",
  };
}
