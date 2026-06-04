import { result, requireString, validateBaseDerivedObject } from "./common.mjs";

export function validateReviewItem(value) {
  const base = validateBaseDerivedObject(value);
  const errors = base.ok ? [] : [...base.errors];

  requireString(errors, value, "reason");
  requireString(errors, value, "suggested_resolution");
  if (typeof value?.blocking !== "boolean") {
    errors.push("blocking must be a boolean.");
  }

  return result(errors);
}
