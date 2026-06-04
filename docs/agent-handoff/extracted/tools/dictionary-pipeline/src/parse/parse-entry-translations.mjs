export function parseEntryTranslations(rawEntryText) {
  const definition = extractDefinitionSegment(rawEntryText);
  const separatorIndex = findMainSeparator(definition);

  if (separatorIndex === -1) {
    return {
      needs_review: true,
      translations: [translation(null, null, definition)],
    };
  }

  const english = definition.slice(0, separatorIndex).trim() || null;
  const spanish = definition.slice(separatorIndex + 1).trim() || null;

  return {
    needs_review: english === null || spanish === null,
    translations: [translation(english, spanish, definition)],
  };
}

function extractDefinitionSegment(rawEntryText) {
  return String(rawEntryText).replace(/^.*?\s+[–—-]\s+/, "").trim();
}

function findMainSeparator(definition) {
  const index = definition.indexOf("/");
  if (index === -1) return -1;
  return index;
}

function translation(englishText, spanishText, rawText) {
  return {
    english_text: englishText,
    spanish_text: spanishText,
    translation_order: 1,
    is_literal: false,
    note: null,
    raw_text: rawText,
  };
}
