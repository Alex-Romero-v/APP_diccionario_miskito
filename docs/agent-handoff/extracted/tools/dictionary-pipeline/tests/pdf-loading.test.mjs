import assert from "node:assert/strict";
import { access, copyFile, mkdtemp, readFile, rm, stat } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import { SOURCE_PDF_PATH } from "../src/config/constants.mjs";
import { loadPdfSource } from "../src/pdf/load-pdf.mjs";

test("loadPdfSource fails if the PDF source does not exist", async () => {
  await assert.rejects(
    () => loadPdfSource({ sourcePdfPath: "tools/dictionary-pipeline/input/missing.pdf" }),
    /\[TRANSCRIPTION_BLOCKED: PDF_MISSING\]/,
  );
});

test("loadPdfSource calculates a SHA-256 hash and verifies 330 pages", async () => {
  const result = await loadPdfSource();

  assert.equal(result.source_pdf_path, SOURCE_PDF_PATH);
  assert.match(result.source_pdf_sha256, /^[a-f0-9]{64}$/);
  assert.equal(result.page_count, 330);
});

test("loadPdfSource blocks page-count mismatches with the required token", async () => {
  await assert.rejects(
    () => loadPdfSource({ expectedPageCount: 999 }),
    /\[TRANSCRIPTION_BLOCKED: PDF_PAGE_COUNT_MISMATCH\]/,
  );
});

test("loadPdfSource does not modify, copy, or rename the PDF", async () => {
  const before = await stat(SOURCE_PDF_PATH);
  const beforeBytes = await readFile(SOURCE_PDF_PATH);

  await loadPdfSource();

  const after = await stat(SOURCE_PDF_PATH);
  const afterBytes = await readFile(SOURCE_PDF_PATH);

  assert.equal(after.size, before.size);
  assert.equal(after.mtimeMs, before.mtimeMs);
  assert.deepEqual(afterBytes, beforeBytes);
  await access(SOURCE_PDF_PATH, fsConstants.R_OK);
});

test("loadPdfSource can load an explicit local PDF path", async () => {
  const dir = await mkdtemp(join(tmpdir(), "dic-pdf-"));
  const copiedPdfPath = join(dir, "source.pdf");

  await copyFile(SOURCE_PDF_PATH, copiedPdfPath);
  const result = await loadPdfSource({ sourcePdfPath: copiedPdfPath });

  assert.equal(result.source_pdf_path, copiedPdfPath);
  assert.equal(result.page_count, 330);

  await rm(dir, { recursive: true, force: true });
});
