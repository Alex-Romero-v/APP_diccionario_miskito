import assert from "node:assert/strict";
import { readdir, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import test from "node:test";

const appendixDir = "tools/dictionary-pipeline/intermediate/appendix";
const expectedFiles = [
  "sections.jsonl",
  "verb_tables.jsonl",
  "grammar_rules.jsonl",
  "phrases.jsonl",
];

test("transcribe:appendix generates valid appendix JSONL only", async () => {
  for (const file of expectedFiles) {
    await rm(`${appendixDir}/${file}`, { force: true });
  }

  const result = spawnSync("npm run transcribe:appendix", {
    encoding: "utf8",
    shell: true,
  });

  assert.equal(result.status, 0, result.stderr || result.stdout);

  for (const file of expectedFiles) {
    const path = `${appendixDir}/${file}`;
    assert.equal(existsSync(path), true, file);
    const records = await readJsonl(path);
    assert.ok(records.length > 0, file);
    assert.ok(records.every((record) => Array.isArray(record.source_blocks)));
  }

  const unexpected = (await readdir(appendixDir)).filter((file) => !expectedFiles.includes(file));
  assert.deepEqual(unexpected, []);
});

test("appendix outputs cover pages 296 to 330 through derived objects or review", async () => {
  const covered = new Set();
  for (const file of expectedFiles) {
    for (const record of await readJsonl(`${appendixDir}/${file}`)) {
      covered.add(record.source_page);
    }
  }
  for (const record of await readJsonl("tools/dictionary-pipeline/intermediate/review/needs_review.jsonl")) {
    if (record.source_page >= 296 && record.source_page <= 330) covered.add(record.source_page);
  }

  for (let page = 296; page <= 330; page += 1) {
    assert.equal(covered.has(page), true, `page ${page}`);
  }
});

async function readJsonl(path) {
  const text = await readFile(path, "utf8");
  return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}
