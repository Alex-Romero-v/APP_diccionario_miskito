export const allowedBlockTypes = new Set([
  "cover_title",
  "cover_subtitle",
  "cover_date",
  "index_item",
  "usage_paragraph",
  "dictionary_note",
  "abbreviation_item",
  "reference_item",
  "bible_book_row",
  "entry_candidate",
  "entry_continuation",
  "example",
  "note",
  "cross_reference",
  "appendix_heading",
  "appendix_paragraph",
  "verb_table_row",
  "grammar_rule",
  "phrase",
  "table_header",
  "table_row",
  "page_number",
  "visual_caption",
  "unclassified",
]);

export function classifyBlock(blockLike) {
  const text = String(blockLike?.text ?? "").trim();
  const section = String(blockLike?.section ?? "");
  let blockType = "unclassified";

  if (/^\d+$/.test(text)) blockType = "page_number";
  else if (/^\(?Ex(?:\/Ej|Ej)?[:(]/i.test(text)) blockType = "example";
  else if (/^\(?Note\/Nota:|^\(?Note:|^\(?Nota:/i.test(text)) blockType = "note";
  else if (/\b(See also|Ver tambi[eé]n|see\/ver|See entry below|Ver entrada debajo)\b/i.test(text)) {
    blockType = "cross_reference";
  } else if (/[|\t]/.test(text)) blockType = "table_row";
  else if (/^[A-Z][A-Z ,]+$/.test(text) || /\b(PHRASES|APPENDIX|VERB TABLES|GRAMMAR)\b/i.test(text)) {
    blockType = "appendix_heading";
  } else if (/^[A-Z]?\.\s+/.test(text)) blockType = "index_item";
  else if (/^[A-Za-z/:-]+\s+.+\/.+/.test(text) && !/[()]/.test(text.slice(0, 20))) {
    blockType = "abbreviation_item";
  } else if (/^[a-z][a-z0-9_-]*\s+-\s+/i.test(text)) blockType = "reference_item";
  else if (/^[A-Z][A-Za-z]+\s+[A-Z][a-z]+\s+/.test(text)) blockType = "bible_book_row";
  else if (/^[\p{L}?'!-]+(?:\s+[\p{L}?'!-]+){0,3}\s*(?:\([^)]*\))?\s*[-–—]/u.test(text)) {
    blockType = "entry_candidate";
  } else blockType = fallbackBlockType(section, text);

  return {
    ...blockLike,
    block_type: blockType,
    confidence: blockType === "unclassified" ? 0.7 : 0.95,
  };
}

function fallbackBlockType(section, text) {
  if (!text) return "unclassified";
  if (section === "usage") return "usage_paragraph";
  if (section === "dictionary_notes") return "dictionary_note";
  if (section === "abbreviations") return "abbreviation_item";
  if (section === "references") return "reference_item";
  if (section === "bible_books") return "bible_book_row";
  if (section === "dictionary") return "entry_continuation";
  if (section === "phrases") return "phrase";
  if (section.includes("grammar")) return "grammar_rule";
  if (section.includes("verb")) return "verb_table_row";
  if (section.startsWith("appendix")) return "appendix_paragraph";
  if (section === "cover") return "cover_subtitle";
  if (section === "index") return "index_item";
  return "appendix_paragraph";
}
