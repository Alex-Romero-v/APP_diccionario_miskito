import { readdir, readFile, writeFile } from "node:fs/promises";

import { ensureDirectories } from "../io/ensure-directories.mjs";

const outputPath = "tools/dictionary-pipeline/reports/transcription_report.md";

export async function buildFinalReport() {
  const totals = {
    "total de entradas": await countJsonl("tools/dictionary-pipeline/intermediate/dictionary_entries"),
    "total de abreviaturas": await countFile("tools/dictionary-pipeline/intermediate/catalog/abbreviations.jsonl"),
    "total de referencias": await countFile("tools/dictionary-pipeline/intermediate/catalog/references.jsonl"),
    "total de libros bíblicos": await countFile("tools/dictionary-pipeline/intermediate/catalog/bible_books.jsonl"),
    "total de frases": await countFile("tools/dictionary-pipeline/intermediate/appendix/phrases.jsonl"),
    "total de reglas": await countFile("tools/dictionary-pipeline/intermediate/appendix/grammar_rules.jsonl"),
    "total de tablas": await countFile("tools/dictionary-pipeline/intermediate/appendix/verb_tables.jsonl"),
    "total de revisiones": await countJsonl("tools/dictionary-pipeline/intermediate/review"),
  };
  const manifest = JSON.parse(await readFile("tools/dictionary-pipeline/intermediate/manifest.json", "utf8"));

  const lines = ["# Transcription Report", ""];
  for (const [label, value] of Object.entries(totals)) lines.push(`${label}: ${value}`);
  lines.push(`estado final: ${manifest.status}`, "");

  await ensureDirectories(["tools/dictionary-pipeline/reports"]);
  await writeFile(outputPath, lines.join("\n"), "utf8");
}

async function countJsonl(directory) {
  try {
    const files = (await readdir(directory)).filter((file) => file.endsWith(".jsonl")).sort();
    let total = 0;
    for (const file of files) total += await countFile(`${directory}/${file}`);
    return total;
  } catch {
    return 0;
  }
}

async function countFile(path) {
  try {
    const text = await readFile(path, "utf8");
    return text.split(/\r?\n/).filter(Boolean).length;
  } catch {
    return 0;
  }
}
