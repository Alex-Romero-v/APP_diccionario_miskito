import { normalizeText } from "./normalize-text.mjs";

export function normalizePhrase(phraseText) {
  return {
    phrase_text: phraseText,
    normalized_phrase: normalizeText(phraseText).normalized_text,
  };
}
