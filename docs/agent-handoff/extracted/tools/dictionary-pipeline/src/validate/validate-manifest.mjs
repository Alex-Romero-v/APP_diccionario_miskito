import { SOURCE_PDF_PATH } from "../config/constants.mjs";
import { validateManifestShape } from "../schemas/manifest.schema.mjs";

export function validateManifest(manifest) {
  const errors = validateManifestShape(manifest);

  requireEqual(errors, manifest?.schema_version, "transcription-intermediate-v1", "schema_version");
  requireEqual(errors, manifest?.source_pdf_path, SOURCE_PDF_PATH, "source_pdf_path");
  requirePattern(errors, manifest?.source_pdf_sha256, /^[a-f0-9]{64}$/, "source_pdf_sha256");
  requireEqual(errors, manifest?.page_count, 330, "page_count");
  requireEqual(errors, manifest?.runtime?.engine, "node", "runtime.engine");
  requireEqual(errors, manifest?.runtime?.python_allowed, false, "runtime.python_allowed");
  requireEqual(errors, manifest?.runtime?.network_allowed, false, "runtime.network_allowed");
  requireOneOf(errors, manifest?.status, ["in_progress", "completed"], "status");

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

function requireEqual(errors, actual, expected, field) {
  if (actual !== expected) {
    errors.push(`${field} must equal ${JSON.stringify(expected)}.`);
  }
}

function requireOneOf(errors, actual, allowed, field) {
  if (!allowed.includes(actual)) {
    errors.push(`${field} must be one of ${allowed.map((value) => JSON.stringify(value)).join(", ")}.`);
  }
}

function requirePattern(errors, actual, pattern, field) {
  if (typeof actual !== "string" || !pattern.test(actual)) {
    errors.push(`${field} must match ${pattern}.`);
  }
}
