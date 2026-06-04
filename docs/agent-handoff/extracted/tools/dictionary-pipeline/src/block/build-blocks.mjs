import { classifyBlock } from "./classify-block.mjs";

export function buildBlocks(lines, options = {}) {
  const { pageNumber, section = "" } = options;

  return lines
    .filter((line) => String(line.text ?? "").trim().length > 0)
    .map((line, index) => {
      const baseBlock = {
        block_id: `p${String(pageNumber).padStart(4, "0")}-b${String(index + 1).padStart(4, "0")}`,
        page_number: pageNumber,
        text: line.text,
        block_type: "unclassified",
        bbox: line.bbox,
        reading_order: index + 1,
        section,
        font_summary: line.font_summary ?? {},
        color_summary: line.color_summary ?? {},
        confidence: 0.7,
      };

      return classifyBlock(baseBlock);
    });
}
