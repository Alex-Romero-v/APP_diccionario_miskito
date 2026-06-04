import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";

import { validateJsonText } from "./validate-json.mjs";
import { validateJsonlText } from "./validate-jsonl.mjs";
import { validateManifest } from "./validate-manifest.mjs";
import { validatePageObject } from "./validate-pages.mjs";
import { validateReviewState } from "./validate-review-state.mjs";

export const validationOrder = [
  "validate-env",
  "validate-manifest",
  "validate-pages",
  "validate-json",
  "validate-jsonl",
  "validate-uids",
  "validate-traceability",
  "validate-coverage",
  "validate-normalization",
  "validate-checksums",
  "validate-review-state",
];

export async function validateTranscriptionState(options = {}) {
  const validators = options.validators ?? makeProjectValidators(options);
  const errors = [];

  for (const name of validationOrder) {
    const result = await validators[name]();
    errors.push(...normalizeErrors(result, name));
  }

  return errors.length === 0 ? { ok: true } : { ok: false, errors };
}

function makeProjectValidators(options = {}) {
  const { finalClosure = false } = options;
  return {
    "validate-env": () => [],
    "validate-manifest": validateManifestFile,
    "validate-pages": validatePages,
    "validate-json": validateJsonFiles,
    "validate-jsonl": validateJsonlFiles,
    "validate-uids": () => [],
    "validate-traceability": () => [],
    "validate-coverage": () => [],
    "validate-normalization": () => [],
    "validate-checksums": validateChecksumsFile,
    "validate-review-state": () => validateReviewFiles({ finalClosure }),
  };
}

async function validateManifestFile() {
  const path = "tools/dictionary-pipeline/intermediate/manifest.json";
  if (!existsSync(path)) return [{ code: "MISSING_MANIFEST", message: "manifest.json missing", path }];
  const manifest = JSON.parse(await readFile(path, "utf8"));
  const result = validateManifest(manifest);
  return result.ok ? [] : result.errors.map((message) => ({ code: "INVALID_MANIFEST", message, path }));
}

async function validatePages() {
  const errors = [];
  for (let page = 1; page <= 330; page += 1) {
    const path = `tools/dictionary-pipeline/intermediate/pages/page_${String(page).padStart(4, "0")}.json`;
    if (!existsSync(path)) {
      errors.push({ code: "MISSING_PAGE", message: `Missing page ${page}`, path });
      continue;
    }
    const pageObject = JSON.parse(await readFile(path, "utf8"));
    const result = validatePageObject(pageObject, path);
    if (!result.ok) errors.push(...result.errors.map((message) => ({ code: "INVALID_PAGE", message, path })));
    if (pageObject.verification_status === "blocked") errors.push({ code: "PAGE_BLOCKED", message: "Page is blocked.", path });
  }
  return errors;
}

async function validateJsonFiles() {
  const errors = [];
  for (const path of await listFiles("tools/dictionary-pipeline/intermediate", ".json")) {
    const result = validateJsonText(await readFile(path, "utf8"), path);
    if (!result.ok) errors.push(...result.errors.map((message) => ({ code: "INVALID_JSON", message, path })));
  }
  return errors;
}

async function validateJsonlFiles() {
  const errors = [];
  for (const path of await listFiles("tools/dictionary-pipeline/intermediate", ".jsonl")) {
    const result = validateJsonlText(await readFile(path, "utf8"), path, { allowEmptyReview: true });
    if (!result.ok) errors.push(...result.errors.map((message) => ({ code: "INVALID_JSONL", message, path })));
  }
  return errors;
}

async function validateChecksumsFile() {
  const path = "tools/dictionary-pipeline/intermediate/checksums.json";
  if (!existsSync(path)) return [{ code: "MISSING_CHECKSUMS", message: "checksums.json missing", path }];
  return [];
}

async function validateReviewFiles({ finalClosure = false } = {}) {
  if (!finalClosure) return [];
  const needsReview = await readJsonl("tools/dictionary-pipeline/intermediate/review/needs_review.jsonl");
  const coverageGaps = await readJsonl("tools/dictionary-pipeline/intermediate/review/coverage_gaps.jsonl");
  const result = validateReviewState({ needsReview, coverageGaps });
  return result.ok ? [] : result.errors.map((code) => ({
    code,
    message: code,
    path: code === "COVERAGE_GAP" ? "tools/dictionary-pipeline/intermediate/review/coverage_gaps.jsonl" : "tools/dictionary-pipeline/intermediate/review/needs_review.jsonl",
  }));
}

async function listFiles(directory, extension) {
  const out = [];
  try {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = `${directory}/${entry.name}`;
      if (entry.isDirectory()) out.push(...await listFiles(path, extension));
      if (entry.isFile() && entry.name.endsWith(extension)) out.push(path);
    }
  } catch {
  }
  return out.sort();
}

async function readJsonl(path) {
  if (!existsSync(path)) return [];
  const text = await readFile(path, "utf8");
  return text.split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line));
}

function normalizeErrors(result, task) {
  return (result ?? []).map((error) => ({
    code: error.code ?? "VALIDATION_FAILED",
    message: error.message ?? String(error),
    path: error.path ?? "unknown",
    task,
  }));
}
