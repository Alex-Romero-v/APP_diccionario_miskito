const circumflexMap = new Map([
  ["â", "a"],
  ["ê", "e"],
  ["î", "i"],
  ["ô", "o"],
  ["û", "u"],
  ["Â", "a"],
  ["Ê", "e"],
  ["Î", "i"],
  ["Ô", "o"],
  ["Û", "u"],
]);

export function normalizeText(rawText) {
  const canonical = String(rawText);
  const normalizedText = [...canonical.normalize("NFC").trim()]
    .map((character) => circumflexMap.get(character) ?? character)
    .join("")
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("en")
    .normalize("NFC");

  return {
    original_text: canonical,
    normalized_text: normalizedText,
  };
}
