import { readJson } from "../io/read-json.mjs";
import { writeJsonlAtomic } from "../io/write-jsonl-atomic.mjs";
import { parseEntry } from "./parse-entry.mjs";

const partitions = [
  [10, 25],
  [26, 50],
  [51, 75],
  [76, 100],
  [101, 125],
  [126, 150],
  [151, 175],
  [176, 200],
  [201, 225],
  [226, 250],
  [251, 275],
  [276, 295],
];

export async function parseDictionaryPages({ pageStart = 10, pageEnd = 295 } = {}) {
  const entries = [];

  for (let pageNumber = pageStart; pageNumber <= pageEnd; pageNumber += 1) {
    const page = await readJson(`tools/dictionary-pipeline/intermediate/pages/page_${String(pageNumber).padStart(4, "0")}.json`);
    for (const block of page.blocks) {
      if (["entry_candidate", "example", "note", "cross_reference"].includes(block.block_type)) {
        entries.push({ ...parseEntry(block), reading_order: block.reading_order });
      }
    }
  }

  return entries;
}

export async function writeDictionaryPartitions() {
  const entries = await parseDictionaryPages({ pageStart: 10, pageEnd: 295 });
  entries.sort(compareEntries);

  for (const [start, end] of partitions) {
    const partitionEntries = entries.filter((entry) => entry.source_page >= start && entry.source_page <= end);
    await writeJsonlAtomic(
      `tools/dictionary-pipeline/intermediate/dictionary_entries/entries_pages_${String(start).padStart(4, "0")}_${String(end).padStart(4, "0")}.jsonl`,
      partitionEntries,
    );
  }

  return entries;
}

function compareEntries(a, b) {
  return (
    a.source_page - b.source_page ||
    a.reading_order - b.reading_order ||
    a.headword.localeCompare(b.headword, "en") ||
    a.uid.localeCompare(b.uid, "en")
  );
}
