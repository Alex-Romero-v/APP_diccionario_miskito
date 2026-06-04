import { dirname } from "node:path";
import { rename, rm, writeFile } from "node:fs/promises";

import { assertWriteScope } from "../guards/assert-write-scope.mjs";
import { ensureDirectories } from "./ensure-directories.mjs";

export async function writeJsonlAtomic(pathToWrite, records, options = {}) {
  const { validateScope = true } = options;

  if (validateScope) {
    assertWriteScope([pathToWrite]);
  }

  const tempPath = `${pathToWrite}.tmp`;

  try {
    const lines = records.map((record) => {
      if (!isJsonObject(record)) {
        throw new Error("JSONL records must be objects.");
      }

      return JSON.stringify(record);
    });

    await ensureDirectories([dirname(pathToWrite)]);
    await writeFile(tempPath, lines.length === 0 ? "" : `${lines.join("\n")}\n`, "utf8");
    await rename(tempPath, pathToWrite);
  } catch (error) {
    await rm(tempPath, { force: true });
    throw error;
  }
}

function isJsonObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
