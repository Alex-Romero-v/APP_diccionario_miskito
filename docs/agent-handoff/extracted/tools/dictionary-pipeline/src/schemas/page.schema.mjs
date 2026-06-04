import {
  result,
  requireArray,
  requireNumber,
  requireObject,
  requireStatus,
  requireString,
  validateBlock,
} from "./common.mjs";

export function validatePage(page) {
  const errors = [];
  requireString(errors, page, "object_type");
  requireString(errors, page, "uid");
  requireNumber(errors, page, "pdf_page_number");
  if (!("printed_page_number" in (page ?? {}))) {
    errors.push("printed_page_number is required.");
  }
  requireString(errors, page, "section");
  requireArray(errors, page, "secondary_sections");
  requireString(errors, page, "raw_text");
  requireString(errors, page, "raw_text_sha256");
  requireArray(errors, page, "blocks");
  requireArray(errors, page, "visual_elements");
  requireArray(errors, page, "derived_objects");
  requireObject(errors, page, "coverage");
  requireStatus(errors, page, "verification_status");
  requireNumber(errors, page, "extraction_confidence");

  page?.blocks?.forEach((block, index) => errors.push(...validateBlock(block, `blocks.${index}`)));

  for (const field of ["raw_chars", "assigned_chars", "unassigned_chars"]) {
    requireNumber(errors, page?.coverage, `coverage.${field}`, field);
  }

  return result(errors);
}
