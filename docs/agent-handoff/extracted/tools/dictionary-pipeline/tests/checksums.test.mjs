import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import test from "node:test";

import { sha256Text } from "../src/io/checksum.mjs";
import { validateChecksums } from "../src/validate/validate-checksums.mjs";

const checksumsPath = "tools/dictionary-pipeline/intermediate/checksums.json";

test("checksums command writes sorted hashes for all intermediate outputs and existing reports", async () => {
  const result = spawnSync("npm run transcribe:checksums", { encoding: "utf8", shell: true });
  assert.equal(result.status, 0, result.stderr || result.stdout);

  const checksums = JSON.parse(await readFile(checksumsPath, "utf8"));
  const keys = Object.keys(checksums);
  assert.deepEqual(keys, [...keys].sort());
  assert.ok(checksums["tools/dictionary-pipeline/input/BYD Bila Yumhpa Diccionario Miskito dictionary 20 diciembre 2024.pdf"]);
  assert.ok(checksums["tools/dictionary-pipeline/intermediate/manifest.json"]);
  assert.ok(checksums["tools/dictionary-pipeline/intermediate/pages/page_0001.json"]);
  assert.ok(keys.some((key) => key.includes("/catalog/") && key.endsWith(".jsonl")));
  assert.ok(keys.some((key) => key.includes("/dictionary_entries/") && key.endsWith(".jsonl")));
  assert.ok(keys.some((key) => key.includes("/appendix/") && key.endsWith(".jsonl")));
  assert.ok(keys.some((key) => key.includes("/review/") && key.endsWith(".jsonl")));
  if ((await existingReports()).length > 0) {
    assert.ok(keys.some((key) => key.includes("/reports/") && key.endsWith(".md")));
  }
  assert.ok(Object.values(checksums).every((hash) => /^[a-f0-9]{64}$/.test(hash)));
});

async function existingReports() {
  try {
    return (await readdir("tools/dictionary-pipeline/reports")).filter((file) => file.endsWith(".md"));
  } catch {
    return [];
  }
}

test("sha256Text changes with content and checksum validation detects missing paths", () => {
  assert.notEqual(sha256Text("a"), sha256Text("b"));
  const result = validateChecksums({
    "tools/dictionary-pipeline/intermediate/manifest.json": "a".repeat(64),
  }, [
    "tools/dictionary-pipeline/intermediate/manifest.json",
    "tools/dictionary-pipeline/intermediate/pages/page_0001.json",
  ]);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("page_0001.json")));
});
