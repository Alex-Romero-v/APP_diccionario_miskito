export function buildLines(items, options = {}) {
  const { pageNumber = 0, verticalTolerance = 2 } = options;
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const groups = [];

  for (const item of sorted) {
    const group = groups.find((candidate) => Math.abs(candidate.y - item.y) <= verticalTolerance);
    if (group) {
      group.items.push(item);
      group.y = Math.min(group.y, item.y);
    } else {
      groups.push({ y: item.y, items: [item] });
    }
  }

  return groups
    .sort((a, b) => Math.max(...b.items.map((item) => item.y)) - Math.max(...a.items.map((item) => item.y)))
    .map((group, index) => buildLine(group.items, pageNumber, index + 1));
}

function buildLine(items, pageNumber, readingOrder) {
  const ordered = [...items].sort((a, b) => a.x - b.x);
  const minX = Math.min(...ordered.map((item) => item.x));
  const minY = Math.min(...ordered.map((item) => item.y));
  const maxX = Math.max(...ordered.map((item) => item.x + item.width));
  const maxY = Math.max(...ordered.map((item) => item.y + item.height));
  const fontNames = [...new Set(ordered.map((item) => item.fontName).filter(Boolean))].sort();
  const colors = [...new Set(ordered.map((item) => item.color).filter(Boolean))].sort();

  return {
    line_id: `p${String(pageNumber).padStart(4, "0")}-l${String(readingOrder).padStart(4, "0")}`,
    text: ordered.map((item) => item.str).join(" ").replace(/\s+/g, " ").trim(),
    bbox: {
      x: round(minX),
      y: round(minY),
      width: round(maxX - minX),
      height: round(maxY - minY),
    },
    font_summary: { font_names: fontNames },
    color_summary: { colors },
    reading_order: readingOrder,
  };
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}
