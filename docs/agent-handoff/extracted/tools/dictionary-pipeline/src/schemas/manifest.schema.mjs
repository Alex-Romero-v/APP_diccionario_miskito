export const manifestSchema = {
  schema_version: "string",
  source_name: "string",
  source_date: "string",
  source_pdf_path: "string",
  source_pdf_sha256: "string",
  page_count: "number",
  language_scope: "array",
  runtime: "object",
  output_mode: "string",
  normalization: "object",
  status: "string",
};

export function validateManifestShape(manifest) {
  const errors = [];

  for (const [field, type] of Object.entries(manifestSchema)) {
    if (type === "array") {
      if (!Array.isArray(manifest?.[field])) {
        errors.push(`${field} must be an array.`);
      }
      continue;
    }

    if (typeof manifest?.[field] !== type || manifest?.[field] === null) {
      errors.push(`${field} must be a ${type}.`);
    }
  }

  return errors;
}
