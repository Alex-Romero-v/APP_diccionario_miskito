export function parseEntryCrossReferences(rawText) {
  const match = String(rawText).match(/See also\/?\s*Ver tambi[eé]n:\s*([^)]*)/i);
  if (!match) return [];
  return [{
    type: "see_also",
    target_text: match[1].trim(),
    raw_text: match[0],
    resolved_target_uid: null,
    resolution_status: "unresolved",
  }];
}
