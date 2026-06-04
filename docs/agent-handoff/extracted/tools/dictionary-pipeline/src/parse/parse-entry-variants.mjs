import { normalizeText } from "../normalize/normalize-text.mjs";

const markerTypes = [
  [/^a\/t:\s*(.+)$/i, "also_spelled", "a/t:"],
  [/^Alt:\s*(.+)$/i, "alternative", "Alt:"],
  [/^fs\/ea:\s*(.+)$/i, "former_spelling", "fs/ea:"],
  [/^former spelling:?\s*(.+)$/i, "former_spelling", "former spelling"],
  [/^also spelled:?\s*(.+)$/i, "also_spelled", "also spelled"],
  [/^alternatively:?\s*(.+)$/i, "alternative", "alternatively"],
  [/^Construct:?\s*(.+)$/i, "construct", "Construct:"],
  [/^irregular:?\s*(.+)$/i, "irregular", "irregular:"],
];

export function parseEntryVariants(rawEntryText, sourceBlocks = []) {
  const variants = [];
  const parentheticals = [...String(rawEntryText).matchAll(/\(([^)]*)\)/g)].map((match) => match[1].trim());

  for (const value of parentheticals) {
    const marker = markerTypes.find(([pattern]) => pattern.test(value));
    if (marker) {
      const [, variantType, note] = marker;
      const variantText = value.match(marker[0])[1];
      variants.push(...splitVariants(variantText).map((text) => buildVariant(text, variantType, note, value, sourceBlocks)));
    } else if (!isPartOfSpeech(value) && !/[,;]/.test(value)) {
      variants.push(buildVariant(value, "parenthetical", null, value, sourceBlocks));
    }
  }

  return variants;
}

function isPartOfSpeech(value) {
  return /^(v|n\/s|adj|adv|conj|pron|pres|fut|int|pos)$/i.test(value);
}

function splitVariants(value) {
  return value.split(/[,;]/).map((part) => part.trim()).filter(Boolean);
}

function buildVariant(variantText, variantType, note, rawText, sourceBlocks) {
  return {
    variant_text: variantText,
    normalized_variant: normalizeText(variantText).normalized_text,
    variant_type: variantType,
    note,
    raw_text: rawText,
    source_blocks: sourceBlocks,
  };
}
