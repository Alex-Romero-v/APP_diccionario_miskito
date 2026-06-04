export function parseEntryNotes(rawText, sourceBlocks = []) {
  const match = String(rawText).match(/\((?:Note\/Nota|Note|Nota):\s*(.*?)\)$/i);
  if (!match) return [];
  return [{
    uid: null,
    note_type: "usage",
    note_text: match[1],
    note_order: 1,
    language: match[1].includes("/") ? "bilingual" : "unknown",
    raw_text: String(rawText),
    source_blocks: sourceBlocks,
  }];
}
