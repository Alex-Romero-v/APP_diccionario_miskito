import assert from "node:assert/strict";
import { readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import test, { after, before } from "node:test";

import { SOURCE_PDF_PATH } from "../src/config/constants.mjs";
import { parseManifest } from "../src/parse/parse-manifest.mjs";
import { validateManifest } from "../src/validate/validate-manifest.mjs";

const manifestPath = "tools/dictionary-pipeline/intermediate/manifest.json";
let originalManifestText = null;

before(async () => {
  originalManifestText = existsSync(manifestPath) ? await readFile(manifestPath, "utf8") : null;
});

after(async () => {
  if (originalManifestText === null) {
    await rm(manifestPath, { force: true });
    return;
  }

  await writeFile(manifestPath, originalManifestText, "utf8");
});

test("parseManifest creates manifest.json by atomic write", async () => {
  await rm(manifestPath, { force: true });
  await rm(`${manifestPath}.tmp`, { force: true });

  const manifest = await parseManifest();

  assert.equal(existsSync(manifestPath), true);
  assert.equal(existsSync(`${manifestPath}.tmp`), false);
  assert.deepEqual(JSON.parse(await readFile(manifestPath, "utf8")), manifest);
});

test("manifest contains required initial transcription metadata", async () => {
  const manifest = await parseManifest();
  const validation = validateManifest(manifest);

  assert.equal(validation.ok, true);
  assert.equal(manifest.schema_version, "transcription-intermediate-v1");
  assert.equal(manifest.source_pdf_path, SOURCE_PDF_PATH);
  assert.match(manifest.source_pdf_sha256, /^[a-f0-9]{64}$/);
  assert.equal(manifest.page_count, 330);
  assert.equal(manifest.runtime.engine, "node");
  assert.equal(manifest.runtime.python_allowed, false);
  assert.equal(manifest.runtime.network_allowed, false);
  assert.equal(manifest.status, "in_progress");
});

test("validateManifest accepts completed status for final closure", async () => {
  const manifest = await parseManifest();
  const validation = validateManifest({ ...manifest, status: "completed" });

  assert.equal(validation.ok, true);
});

test("validateManifest rejects invalid manifests", () => {
  const validation = validateManifest({
    schema_version: "wrong",
    page_count: 1,
  });

  assert.equal(validation.ok, false);
  assert.match(validation.errors.join("\n"), /source_pdf_path/);
});
