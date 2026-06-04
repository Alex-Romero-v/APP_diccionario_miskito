import { access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";

import { BLOCK_TOKENS, SOURCE_PDF_PATH } from "./config/constants.mjs";
import { assertNoNetwork } from "./guards/assert-no-network.mjs";
import { assertNoPythonUsage } from "./guards/assert-no-python.mjs";
import { assertNodeRuntime } from "./guards/assert-node-runtime.mjs";
import { assertWriteScope } from "./guards/assert-write-scope.mjs";
import { parseManifest } from "./parse/parse-manifest.mjs";
import { extractPages } from "./parse/extract-pages.mjs";
import { parseAbbreviations } from "./parse/parse-abbreviations.mjs";
import { parseReferences } from "./parse/parse-references.mjs";
import { parseBibleBooks } from "./parse/parse-bible-books.mjs";
import { writeDictionaryPartitions } from "./parse/parse-dictionary-pages.mjs";
import { parseAppendix } from "./parse/parse-appendix.mjs";
import { parseVerbTables } from "./parse/parse-verb-tables.mjs";
import { parseGrammarRules } from "./parse/parse-grammar-rules.mjs";
import { parsePhrases } from "./parse/parse-phrases.mjs";
import { writeChecksums } from "./parse/parse-checksums.mjs";
import { validateTranscriptionState } from "./validate/validate-transcription.mjs";

const allowedCommands = new Set([
  "validate-env",
  "init",
  "extract-pages",
  "parse-catalog",
  "parse-dictionary",
  "parse-appendix",
  "checksums",
  "validate-transcription",
]);

const command = process.argv[2];

try {
  await main(command);
} catch (error) {
  const message = error instanceof Error ? error.message : "VALIDATION_FAILED";
  console.error(message);
  process.exitCode = 1;
}

async function main(commandName) {
  if (!allowedCommands.has(commandName)) {
    throw new Error("[TASK_BLOCKED: UNKNOWN_TASK: UNKNOWN_TASK]");
  }

  await validateEnvironment();

  if (commandName === "init") {
    await parseManifest();
  }

  if (commandName === "extract-pages") {
    await extractPages();
  }

  if (commandName === "parse-catalog") {
    await parseAbbreviations();
    await parseReferences();
    await parseBibleBooks();
  }

  if (commandName === "parse-dictionary") {
    await writeDictionaryPartitions();
  }

  if (commandName === "parse-appendix") {
    await parseAppendix();
    await parseVerbTables();
    await parseGrammarRules();
    await parsePhrases();
  }

  if (commandName === "checksums") {
    await writeChecksums();
  }

  if (commandName === "validate-transcription") {
    const result = await validateTranscriptionState({ finalClosure: true });
    if (!result.ok) {
      throw new Error(JSON.stringify(result.errors, null, 2));
    }
  }
}

async function validateEnvironment() {
  assertNodeRuntime();
  assertNoNetwork({ env: process.env });
  await assertNoPythonInPackageScripts();
  assertWriteScope([]);
  assertExecutable("node", BLOCK_TOKENS.nodeUnavailable);
  assertExecutable("npm", BLOCK_TOKENS.npmUnavailable);

  try {
    await access(SOURCE_PDF_PATH, fsConstants.R_OK);
  } catch {
    throw new Error(BLOCK_TOKENS.pdfMissing);
  }
}

async function assertNoPythonInPackageScripts() {
  const packageJson = JSON.parse(await readFile("package.json", "utf8"));
  assertNoPythonUsage(packageJson.scripts ?? {});
}

function assertExecutable(binaryName, blockedToken) {
  if (process.platform === "win32" && binaryName === "npm") {
    const result = spawnSync("npm --version", {
      encoding: "utf8",
      shell: true,
    });

    if (result.status !== 0) {
      throw new Error(blockedToken);
    }

    return;
  }

  const candidates =
    process.platform === "win32" && binaryName === "npm" ? ["npm.cmd"] : [binaryName];

  const passed = candidates.some((candidate) => {
    const result = spawnSync(candidate, ["--version"], {
      encoding: "utf8",
      shell: false,
    });

    return result.status === 0;
  });

  if (!passed) {
    throw new Error(blockedToken);
  }
}
