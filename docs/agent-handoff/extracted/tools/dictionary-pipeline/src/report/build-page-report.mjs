import { readdir, readFile, writeFile } from "node:fs/promises";

import { ensureDirectories } from "../io/ensure-directories.mjs";

const outputPath = "tools/dictionary-pipeline/reports/page_extraction_report.md";

export async function buildPageReport() {
  const pages = await readPages();
  const lines = [
    "# Page Extraction Report",
    "",
    `conteo de páginas: ${pages.length}`,
    "",
    "| página | conteo de bloques por página | sección detectada | elementos visuales | tabla | texto de color |",
    "| --- | ---: | --- | ---: | --- | --- |",
  ];

  for (const page of pages) {
    lines.push(`| ${page.pdf_page_number} | ${page.blocks.length} | ${page.section} | ${page.visual_elements.length} | ${hasTable(page) ? "yes" : "no"} | ${hasColor(page) ? "yes" : "no"} |`);
  }

  lines.push(
    "",
    `páginas con elementos visuales: ${pages.filter((page) => page.visual_elements.length > 0).length}`,
    `páginas con tablas: ${pages.filter(hasTable).length}`,
    `páginas con texto de color: ${pages.filter(hasColor).length}`,
    "",
  );

  await ensureDirectories(["tools/dictionary-pipeline/reports"]);
  await writeFile(outputPath, `${lines.join("\n")}`, "utf8");
}

async function readPages() {
  const dir = "tools/dictionary-pipeline/intermediate/pages";
  const files = (await readdir(dir)).filter((file) => /^page_\d{4}\.json$/.test(file)).sort();
  return Promise.all(files.map(async (file) => JSON.parse(await readFile(`${dir}/${file}`, "utf8"))));
}

function hasTable(page) {
  return page.blocks.some((block) => /table|tabla|present|past|future|pasado|futuro/i.test(block.text));
}

function hasColor(page) {
  return page.blocks.some((block) => (block.color_summary?.colors ?? []).length > 0);
}
