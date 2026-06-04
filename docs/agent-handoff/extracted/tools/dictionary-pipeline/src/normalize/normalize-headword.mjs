import { normalizeText } from "./normalize-text.mjs";

export function normalizeHeadword(headword) {
  const normalized = normalizeText(headword).normalized_text;

  return {
    headword,
    normalized_headword: normalized,
    sort_key: normalized,
  };
}
