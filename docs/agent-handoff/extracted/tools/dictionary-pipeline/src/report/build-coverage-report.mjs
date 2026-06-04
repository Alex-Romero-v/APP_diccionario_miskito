import { readdir, readFile, writeFile } from "node:fs/promises";

import { ensureDirectories } from "../io/ensure-directories.mjs";

const outputPath = "tools/dictionary-pipeline/reports/coverage_report.md";

export async function buildCoverageReport() {
  const pages = await readPages();
  const lines = [
    "# Coverage Report",
    "",
    "| página | raw_chars por página | assigned_chars por página | unassigned_chars por página | estado por página |",
    "| --- | ---: | ---: | ---: | --- |",
  ];

  for (const page of pages) {
    lines.push(`| ${page.pdf_page_number} | ${page.coverage.raw_chars} | ${page.coverage.assigned_chars} | ${page.coverage.unassigned_chars} | ${page.verification_status} |`);
  }
  lines.push("");

  await ensureDirectories(["tools/dictionary-pipeline/reports"]);
  await writeFile(outputPath, lines.join("\n"), "utf8");
}

async function readPages() {
  const dir = "tools/dictionary-pipeline/intermediate/pages";
  const files = (await readdir(dir)).filter((file) => /^page_\d{4}\.json$/.test(file)).sort();
  return Promise.all(files.map(async (file) => JSON.parse(await readFile(`${dir}/${file}`, "utf8"))));
}
