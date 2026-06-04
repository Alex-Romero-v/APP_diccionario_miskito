import { SOURCE_PDF_PATH } from "../config/constants.mjs";
import { writeJsonAtomic } from "../io/write-json-atomic.mjs";
import { loadPdfSource } from "../pdf/load-pdf.mjs";
import { validateManifest } from "../validate/validate-manifest.mjs";

const manifestPath = "tools/dictionary-pipeline/intermediate/manifest.json";

export async function parseManifest() {
  const source = await loadPdfSource();
  const manifest = {
    schema_version: "transcription-intermediate-v1",
    source_name: "BYD Bila Yumhpa Diccionario Miskito Dictionary",
    source_date: "2024-12-20",
    source_pdf_path: SOURCE_PDF_PATH,
    source_pdf_sha256: source.source_pdf_sha256,
    page_count: source.page_count,
    language_scope: ["miskito", "english", "spanish"],
    runtime: {
      engine: "node",
      python_allowed: false,
      network_allowed: false,
    },
    output_mode: "jsonl-partitioned",
    normalization: {
      unicode: "NFC",
      preserve_diacritics: true,
      create_diacriticless_search_forms: true,
    },
    status: "in_progress",
  };

  const validation = validateManifest(manifest);

  if (!validation.ok) {
    throw new Error(validation.errors.join("\n"));
  }

  await writeJsonAtomic(manifestPath, manifest);

  return manifest;
}
