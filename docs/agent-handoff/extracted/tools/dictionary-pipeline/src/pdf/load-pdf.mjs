import { access, readFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

import { SOURCE_PDF_PATH } from "../config/constants.mjs";
import { sha256File } from "../io/checksum.mjs";

export async function loadPdfSource(options = {}) {
  const {
    sourcePdfPath = SOURCE_PDF_PATH,
    expectedPageCount = 330,
    includeDocument = false,
  } = options;

  try {
    await access(sourcePdfPath, fsConstants.R_OK);
  } catch {
    throw new Error("[TRANSCRIPTION_BLOCKED: PDF_MISSING]");
  }

  const sourcePdfSha256 = await sha256File(sourcePdfPath);
  const data = new Uint8Array(await readFile(sourcePdfPath));
  const pdf = await getDocument({ data, disableWorker: true }).promise;

  if (pdf.numPages !== expectedPageCount) {
    throw new Error("[TRANSCRIPTION_BLOCKED: PDF_PAGE_COUNT_MISMATCH]");
  }

  const metadata = {
    source_pdf_path: sourcePdfPath,
    source_pdf_sha256: sourcePdfSha256,
    page_count: pdf.numPages,
  };

  if (includeDocument) {
    return {
      ...metadata,
      pdf,
    };
  }

  if (typeof pdf.destroy === "function") {
    await pdf.destroy();
  }

  return metadata;
}
