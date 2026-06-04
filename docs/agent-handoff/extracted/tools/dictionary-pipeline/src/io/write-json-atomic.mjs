import { dirname } from "node:path";
import { rename, rm, writeFile } from "node:fs/promises";

import { assertWriteScope } from "../guards/assert-write-scope.mjs";
import { ensureDirectories } from "./ensure-directories.mjs";

export async function writeJsonAtomic(pathToWrite, value, options = {}) {
  const { validateScope = true } = options;

  if (validateScope) {
    assertWriteScope([pathToWrite]);
  }

  const tempPath = `${pathToWrite}.tmp`;

  try {
    await ensureDirectories([dirname(pathToWrite)]);
    const serialized = `${JSON.stringify(value, null, 2)}\n`;
    await writeFile(tempPath, serialized, "utf8");
    await renameWithRetry(tempPath, pathToWrite);
  } catch (error) {
    await rm(tempPath, { force: true });
    throw error;
  }
}

async function renameWithRetry(from, to) {
  const retryableCodes = new Set(["EBUSY", "EPERM"]);
  let lastError;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      await rename(from, to);
      return;
    } catch (error) {
      lastError = error;
      if (!retryableCodes.has(error?.code)) break;
      await delay(50 * (attempt + 1));
    }
  }

  throw lastError;
}

function delay(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}
