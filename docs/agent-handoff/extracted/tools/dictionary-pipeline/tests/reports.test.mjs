import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import test from "node:test";

import { buildPageReport } from "../src/report/build-page-report.mjs";
import { buildCoverageReport } from "../src/report/build-coverage-report.mjs";
import { buildFinalReport } from "../src/report/build-final-report.mjs";

test("report builders write reproducible extraction, coverage, and transcription reports", async () => {
  await rm("tools/dictionary-pipeline/reports", { recursive: true, force: true });
  await buildPageReport();
  await buildCoverageReport();
  await buildFinalReport();

  for (const path of [
    "tools/dictionary-pipeline/reports/page_extraction_report.md",
    "tools/dictionary-pipeline/reports/coverage_report.md",
    "tools/dictionary-pipeline/reports/transcription_report.md",
  ]) {
    assert.equal(existsSync(path), true, path);
  }

  const pageReport = await readFile("tools/dictionary-pipeline/reports/page_extraction_report.md", "utf8");
  assert.match(pageReport, /conteo de páginas/i);
  assert.match(pageReport, /conteo de bloques por página/i);
  assert.match(pageReport, /sección detectada/i);
  assert.match(pageReport, /páginas con elementos visuales/i);
  assert.match(pageReport, /páginas con tablas/i);
  assert.match(pageReport, /páginas con texto de color/i);

  const coverageReport = await readFile("tools/dictionary-pipeline/reports/coverage_report.md", "utf8");
  assert.match(coverageReport, /raw_chars por página/i);
  assert.match(coverageReport, /assigned_chars por página/i);
  assert.match(coverageReport, /unassigned_chars por página/i);
  assert.match(coverageReport, /estado por página/i);

  const finalReport = await readFile("tools/dictionary-pipeline/reports/transcription_report.md", "utf8");
  for (const label of [
    "total de entradas",
    "total de abreviaturas",
    "total de referencias",
    "total de libros bíblicos",
    "total de frases",
    "total de reglas",
    "total de tablas",
    "total de revisiones",
    "estado final",
  ]) {
    assert.match(finalReport, new RegExp(label, "i"));
  }
});
