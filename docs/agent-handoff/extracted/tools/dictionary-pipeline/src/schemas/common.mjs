export const allowedVerificationStatuses = new Set([
  "parsed",
  "verified",
  "needs_review",
  "blocked",
  "rejected",
]);

export function validateBaseDerivedObject(value, objectName = "object") {
  const errors = [];
  requireString(errors, value, "object_type");
  requireString(errors, value, "uid");
  requireNumber(errors, value, "source_page");
  requireArray(errors, value, "source_blocks");
  requireString(errors, value, "raw_text");
  requireNumber(errors, value, "extraction_confidence");
  requireStatus(errors, value, "verification_status");
  return result(errors);
}

export function validateBlock(value, path = "block") {
  const errors = [];
  requireString(errors, value, `${path}.block_id`, "block_id");
  requireNumber(errors, value, `${path}.page_number`, "page_number");
  requireString(errors, value, `${path}.text`, "text");
  requireString(errors, value, `${path}.block_type`, "block_type");
  requireObject(errors, value, `${path}.bbox`, "bbox");
  requireNumber(errors, value, `${path}.reading_order`, "reading_order");
  requireObject(errors, value, `${path}.font_summary`, "font_summary");
  requireObject(errors, value, `${path}.color_summary`, "color_summary");
  requireNumber(errors, value, `${path}.confidence`, "confidence");
  return errors;
}

export function result(errors) {
  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

export function requireString(errors, value, path, key = path) {
  if (typeof value?.[key] !== "string") {
    errors.push(`${path} must be a string.`);
  }
}

export function requireNumber(errors, value, path, key = path) {
  if (typeof value?.[key] !== "number" || Number.isNaN(value?.[key])) {
    errors.push(`${path} must be a number.`);
  }
}

export function requireArray(errors, value, path, key = path) {
  if (!Array.isArray(value?.[key])) {
    errors.push(`${path} must be an array.`);
  }
}

export function requireObject(errors, value, path, key = path) {
  if (typeof value?.[key] !== "object" || value?.[key] === null || Array.isArray(value?.[key])) {
    errors.push(`${path} must be an object.`);
  }
}

export function requireStatus(errors, value, path, key = path) {
  if (!allowedVerificationStatuses.has(value?.[key])) {
    errors.push(`${path} must be one of parsed, verified, needs_review, blocked, rejected.`);
  }
}
