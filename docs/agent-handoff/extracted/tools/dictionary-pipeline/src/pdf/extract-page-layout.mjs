import { buildLines } from "../block/build-lines.mjs";

export function extractPageLayout(extractedPageText) {
  return {
    page_number: extractedPageText.page_number,
    lines: buildLines(extractedPageText.items, { pageNumber: extractedPageText.page_number }),
  };
}
