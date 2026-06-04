import { sha256Text } from "../io/checksum.mjs";

export async function extractPageText(page, pageNumber) {
  const textContent = await page.getTextContent({
    disableNormalization: true,
    includeMarkedContent: true,
  });

  const items = textContent.items
    .filter((item) => typeof item?.str === "string")
    .map((item, index) => ({
      item_index: index,
      str: item.str,
      transform: Array.isArray(item.transform) ? [...item.transform] : [],
      width: numberOrZero(item.width),
      height: numberOrZero(item.height),
      fontName: item.fontName ?? null,
      dir: item.dir ?? null,
      hasEOL: Boolean(item.hasEOL),
      x: Array.isArray(item.transform) ? numberOrZero(item.transform[4]) : 0,
      y: Array.isArray(item.transform) ? numberOrZero(item.transform[5]) : 0,
    }));

  const rawText = items.map((item) => item.str).join("\n");

  if (rawText.length === 0) {
    throw new Error(`[PAGE_BLOCKED: ${pageNumber}: PDF_TEXT_UNREADABLE]`);
  }

  return {
    page_number: pageNumber,
    items,
    raw_text: rawText,
    raw_text_sha256: sha256Text(rawText),
  };
}

function numberOrZero(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}
