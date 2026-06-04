export function validateCoverage(coverage) {
  const errors = [];

  for (const field of ["raw_chars", "assigned_chars", "unassigned_chars"]) {
    if (typeof coverage?.[field] !== "number" || coverage[field] < 0) {
      errors.push(`${field} must be a non-negative number.`);
    }
  }

  if (
    typeof coverage?.raw_chars === "number" &&
    typeof coverage?.assigned_chars === "number" &&
    typeof coverage?.unassigned_chars === "number" &&
    coverage.raw_chars !== coverage.assigned_chars + coverage.unassigned_chars
  ) {
    errors.push("raw_chars must equal assigned_chars + unassigned_chars.");
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}
