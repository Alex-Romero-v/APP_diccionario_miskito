export function assignCoverage(page, options = {}) {
  const { countPageRawText = true } = options;
  const rawChars = String(page.raw_text ?? "").length;
  const blockChars = (page.blocks ?? []).reduce((total, block) => total + String(block.text ?? "").length, 0);
  const assignedChars = countPageRawText ? rawChars : Math.min(rawChars, blockChars);
  const unassignedChars = Math.max(0, rawChars - assignedChars);

  const coverage = {
    raw_chars: rawChars,
    assigned_chars: assignedChars,
    unassigned_chars: unassignedChars,
  };

  const coverage_gaps =
    unassignedChars > 0
      ? [
          reviewItem({
            uid: `review-p${String(page.pdf_page_number).padStart(4, "0")}-coverage`,
            page,
            sourceBlocks: [],
            rawText: page.raw_text,
            reason: "Coverage gap detected.",
            suggestedResolution: "Assign remaining text to a valid category.",
          }),
        ]
      : [];

  const needs_review = (page.blocks ?? [])
    .filter((block) => block.block_type === "unclassified")
    .map((block) =>
      reviewItem({
        uid: `review-${block.block_id}`,
        page,
        sourceBlocks: [block.block_id],
        rawText: block.text,
        reason: "Unclassified block.",
        suggestedResolution: "Review against source PDF.",
      }),
    );

  return {
    coverage,
    coverage_gaps,
    needs_review,
  };
}

function reviewItem({ uid, page, sourceBlocks, rawText, reason, suggestedResolution }) {
  return {
    object_type: "review_item",
    uid,
    source_page: page.pdf_page_number,
    source_blocks: sourceBlocks,
    raw_text: rawText,
    reason,
    suggested_resolution: suggestedResolution,
    blocking: true,
    verification_status: "needs_review",
  };
}
