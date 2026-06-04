import { result, requireString, validateBaseDerivedObject } from "./common.mjs";

export function validateCatalogObject(value) {
  const base = validateBaseDerivedObject(value);
  const errors = base.ok ? [] : [...base.errors];

  if (value?.object_type === "abbreviation") {
    requireString(errors, value, "code");
  }

  return result(errors);
}
