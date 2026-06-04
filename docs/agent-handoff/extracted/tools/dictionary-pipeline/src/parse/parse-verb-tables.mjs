import { readFile } from "node:fs/promises";

import { readJson } from "../io/read-json.mjs";
import { writeJsonlAtomic } from "../io/write-jsonl-atomic.mjs";

const verbTablesPath = "tools/dictionary-pipeline/intermediate/appendix/verb_tables.jsonl";
const needsReviewPath = "tools/dictionary-pipeline/intermediate/review/needs_review.jsonl";

const tablePages = new Set([298, 303, 304, 308, 309]);

export async function parseVerbTables() {
  const rows = [];
  const reviews = [];

  for (const pageNumber of tablePages) {
    const page = await readJson(`tools/dictionary-pipeline/intermediate/pages/page_${String(pageNumber).padStart(4, "0")}.json`);
    let tableIndex = 0;

    for (const block of page.blocks) {
      if (block.block_type === "page_number") continue;
      if (isTableTitle(block.text)) {
        tableIndex += 1;
        continue;
      }
      if (!isVerbTableBlock(block)) continue;

      const tableUid = `verb-table-p${String(pageNumber).padStart(4, "0")}-${String(Math.max(tableIndex, 1)).padStart(2, "0")}`;
      const parsed = splitColumns(block.text);
      const status = parsed.needsReview ? "needs_review" : "parsed";
      const row = {
        object_type: "verb_table_row",
        table_uid: tableUid,
        row_uid: `${tableUid}-r${String(block.reading_order).padStart(4, "0")}`,
        columns: parsed.columns,
        raw_text: block.text,
        source_page: pageNumber,
        source_blocks: [block.block_id],
        coordinates_used: !parsed.needsReview && hasUsableBbox(block),
        extraction_confidence: parsed.needsReview ? 0.55 : 0.82,
        verification_status: status,
      };

      if (row.coordinates_used) {
        row.columns = row.columns.map((value, index) => ({
          column_index: index + 1,
          text: value,
          bbox: estimateColumnBbox(block.bbox, row.columns.length, index),
        }));
      }

      rows.push(row);

      if (parsed.needsReview) {
        reviews.push({
          object_type: "review_item",
          uid: `review-${row.row_uid}`,
          source_page: pageNumber,
          source_blocks: [block.block_id],
          raw_text: block.text,
          reason: "Verb table row could not be separated into columns.",
          suggested_resolution: "Review visible table columns against source PDF.",
          blocking: false,
          verification_status: "needs_review",
        });
      }
    }
  }

  await writeJsonlAtomic(verbTablesPath, rows);
  await writeJsonlAtomic(needsReviewPath, await mergeReviewItems(reviews));
  return rows;
}

function isTableTitle(text) {
  return /(?:Regular Verbs|Kaia|Balaia|Waia|Present I|Present II|Past I|Future I|Future II)/i.test(text);
}

function isVerbTableBlock(block) {
  if (!block?.text || block.text.trim().length === 0) return false;
  if (block.reading_order <= 2) return false;
  if (!tablePages.has(block.page_number)) return false;
  return (
    /^(Yang|Man|Witin|Yawan|Yang nani|Man nani|Witin nani)\b/i.test(block.text) ||
    /^(Present|Presente|Past|Pasado|Future|Futuro)\b/i.test(block.text) ||
    /^(Imperative|Imperativa|Prohibitive|Prohibitiva|Negative|Negativa|Present participle|Participio presente)\b/i.test(block.text) ||
    /^(st|nd|rd)\b/i.test(block.text)
  );
}

function splitColumns(rawText) {
  const text = rawText.trim().replace(/\s+/g, " ");

  if (/^(st|nd|rd)\b/i.test(text)) {
    return { columns: [text], needsReview: true };
  }

  if (text.includes(" / ")) {
    const columns = text.split(/\s+\/\s+/).map((column) => column.trim()).filter(Boolean);
    if (columns.length > 1) return { columns, needsReview: false };
  }

  const personMatch = text.match(/^(Yang nani|Man nani|Witin nani|Yang|Man|Witin(?:\(3\s*\/\s*3\s*\),Yawan)?|Yawan)\s*(?:\([^)]*\))?\s+(?<forms>.+)$/i);
  if (personMatch?.groups?.forms) {
    const label = text.slice(0, text.length - personMatch.groups.forms.length).trim();
    const forms = personMatch.groups.forms.split(/\s+/).filter(Boolean);
    if (forms.length >= 3) return { columns: [label, ...forms], needsReview: false };
  }

  const labelMatch = text.match(/^(Imperative|Imperativa|Prohibitive|Prohibitiva|Negative|Negativa|Present participle|Participio presente)\s*[:/]\s*(?<value>.+)$/i);
  if (labelMatch?.groups?.value) {
    return { columns: [text.slice(0, text.length - labelMatch.groups.value.length).trim(), labelMatch.groups.value.trim()], needsReview: false };
  }

  return { columns: [text], needsReview: true };
}

function hasUsableBbox(block) {
  return typeof block?.bbox?.x === "number" && typeof block?.bbox?.width === "number" && block.bbox.width > 0;
}

function estimateColumnBbox(bbox, count, index) {
  const width = bbox.width / count;
  return {
    x: Number((bbox.x + width * index).toFixed(3)),
    y: bbox.y,
    width: Number(width.toFixed(3)),
    height: bbox.height,
  };
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
