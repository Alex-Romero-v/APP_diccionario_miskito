import { readdir } from "node:fs/promises";
import { join } from "node:path";

import { SOURCE_PDF_PATH } from "../config/constants.mjs";
import { sha256File } from "../io/checksum.mjs";
import { writeJsonAtomic } from "../io/write-json-atomic.mjs";

const outputPath = "tools/dictionary-pipeline/intermediate/checksums.json";

export async function writeChecksums() {
  const paths = await collectChecksumPaths();
  const checksums = {};

  for (const path of paths.sort()) {
    checksums[path] = await sha256File(path);
  }

  await writeJsonAtomic(outputPath, checksums);
  return checksums;
}

async function collectChecksumPaths() {
  const paths = [SOURCE_PDF_PATH, "tools/dictionary-pipeline/intermediate/manifest.json"];
  for (const directory of [
    "tools/dictionary-pipeline/intermediate/pages",
    "tools/dictionary-pipeline/intermediate/catalog",
    "tools/dictionary-pipeline/intermediate/dictionary_entries",
    "tools/dictionary-pipeline/intermediate/appendix",
    "tools/dictionary-pipeline/intermediate/review",
    "tools/dictionary-pipeline/reports",
  ]) {
    paths.push(...await listFiles(directory));
  }
  return [...new Set(paths)].filter((path) => path !== outputPath).sort();
}

async function listFiles(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true });
    const paths = [];
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const child = join(directory, entry.name).replaceAll("\\", "/");
      if (entry.isDirectory()) paths.push(...await listFiles(child));
      if (entry.isFile() && /\.(json|jsonl|md)$/.test(entry.name)) paths.push(child);
    }
    return paths;
  } catch {
    return [];
  }
}
