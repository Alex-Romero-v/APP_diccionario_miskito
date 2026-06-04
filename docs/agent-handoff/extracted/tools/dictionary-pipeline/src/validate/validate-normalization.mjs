export function validateNormalization(record) {
  const errors = [];
  const uid = record.uid ?? "unknown";

  for (const [field, expectedField] of [
    ["raw_text", "expected_raw_text"],
    ["headword", "expected_headword"],
    ["phrase_text", "expected_phrase_text"],
  ]) {
    if (expectedField in record && record[field] !== record[expectedField]) {
      errors.push(`${uid}: ${field} lost canonical text or diacritics.`);
    }
  }

  if ("raw_text" in record && "expected_raw_text" in record && hasCircumflex(record.expected_raw_text) && !hasCircumflex(record.raw_text)) {
    errors.push(`${uid}: raw_text lost circumflex.`);
  }
  if ("headword" in record && "expected_headword" in record && hasCircumflex(record.expected_headword) && !hasCircumflex(record.headword)) {
    errors.push(`${uid}: headword lost circumflex.`);
  }
  if ("phrase_text" in record && "expected_phrase_text" in record && hasCircumflex(record.expected_phrase_text) && !hasCircumflex(record.phrase_text)) {
    errors.push(`${uid}: phrase_text lost circumflex.`);
  }

  if ("normalized_headword" in record && "headword" in record) {
    const expected = auxiliaryNormalize(record.headword);
    validateNormalizedField(errors, uid, "normalized_headword", record.normalized_headword, expected);
  }

  if ("normalized_phrase" in record && "phrase_text" in record) {
    const expected = auxiliaryNormalize(record.phrase_text);
    validateNormalizedField(errors, uid, "normalized_phrase", record.normalized_phrase, expected);
  }

  if ("normalized_text" in record && "raw_text" in record) {
    const expected = auxiliaryNormalize(record.raw_text);
    validateNormalizedField(errors, uid, "normalized_text", record.normalized_text, expected);
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

function validateNormalizedField(errors, uid, field, actual, expected) {
  if (actual !== actual?.normalize("NFC")) errors.push(`${uid}: ${field} must be NFC.`);
  if (actual !== expected) errors.push(`${uid}: ${field} is incomplete; expected ${expected}.`);
  if (/\s{2,}/.test(actual)) errors.push(`${uid}: ${field} has uncollapsed internal spaces.`);
}

function hasCircumflex(value) {
  return /[âêîôûÂÊÎÔÛÃ¢ÃªÃ®Ã´Ã»Ã‚ÃŠÃŽÃ”Ã›]/.test(String(value));
}

function auxiliaryNormalize(value) {
  return String(value)
    .replaceAll("Ã¢", "a")
    .replaceAll("Ãª", "e")
    .replaceAll("Ã®", "i")
    .replaceAll("Ã´", "o")
    .replaceAll("Ã»", "u")
    .replaceAll("Ã‚", "a")
    .replaceAll("ÃŠ", "e")
    .replaceAll("ÃŽ", "i")
    .replaceAll("Ã”", "o")
    .replaceAll("Ã›", "u")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[âêîôûÂÊÎÔÛ]/g, (character) => ({
      â: "a",
      ê: "e",
      î: "i",
      ô: "o",
      û: "u",
      Â: "a",
      Ê: "e",
      Î: "i",
      Ô: "o",
      Û: "u",
    })[character] ?? character)
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("en")
    .normalize("NFC");
}
