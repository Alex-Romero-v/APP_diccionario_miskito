import { validateCoverage } from "./validate-coverage.mjs";
import { validatePage } from "../schemas/page.schema.mjs";

export function validatePageObject(page, path = "page") {
  const errors = [];
  const schema = validatePage(page);
  if (!schema.ok) errors.push(...schema.errors.map((error) => `${path}: ${error}`));

  if (page?.coverage !== undefined) {
    const coverage = validateCoverage(page.coverage);
    if (!coverage.ok) errors.push(...coverage.errors.map((error) => `${path}: coverage.${error}`));
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}
