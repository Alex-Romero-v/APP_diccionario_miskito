export function parseEntryExamples(rawText, sourceBlocks = []) {
  const text = String(rawText);
  const match = text.match(/\(Ex\/Ej(?:\(([^)]*)\))?:\s*(.*?)\)/i);
  if (!match) return [];
  const body = match[2].trim();
  const [miskito, rest = ""] = body.split(/\s+[–—-]\s+/, 2);
  const slash = rest.indexOf("/");
  return [{
    uid: null,
    miskito_text: miskito.trim(),
    english_text: slash === -1 ? null : rest.slice(0, slash).trim(),
    spanish_text: slash === -1 ? null : rest.slice(slash + 1).trim(),
    source_code: match[1]?.split("-")[0] ?? null,
    source_detail: match[1]?.split("-").slice(1).join("-") || null,
    example_order: 1,
    is_literal_translation: true,
    raw_reference_text: match[1] ?? null,
    raw_text: text,
    source_blocks: sourceBlocks,
  }];
}
