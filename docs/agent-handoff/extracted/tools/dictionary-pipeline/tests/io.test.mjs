import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import test from "node:test";

import { sha256File, sha256Text } from "../src/io/checksum.mjs";
import { ensureDirectories } from "../src/io/ensure-directories.mjs";
import { listFilesDeterministic } from "../src/io/list-files-deterministic.mjs";
import { readJson } from "../src/io/read-json.mjs";
import { writeJsonAtomic } from "../src/io/write-json-atomic.mjs";
import { writeJsonlAtomic } from "../src/io/write-jsonl-atomic.mjs";

test("ensure-directories creates nested directories deterministically", async () => {
  const dir = await mkdtemp(join(tmpdir(), "dic-io-"));
  const nested = join(dir, "a", "b", "c");

  await ensureDirectories([nested]);

  assert.equal((await stat(nested)).isDirectory(), true);
  await rm(dir, { recursive: true, force: true });
});

test("writeJsonAtomic writes stable JSON with a final newline", async () => {
  const dir = await mkdtemp(join(tmpdir(), "dic-io-"));
  const target = join(dir, "sample.json");

  await writeJsonAtomic(target, { b: 2, a: 1 }, { validateScope: false });

  assert.deepEqual(await readJson(target), { b: 2, a: 1 });
  assert.equal(await readFile(target, "utf8"), '{\n  "b": 2,\n  "a": 1\n}\n');
  assert.equal(existsSync(`${target}.tmp`), false);
  await rm(dir, { recursive: true, force: true });
});

test("writeJsonAtomic removes temporary file if serialization fails", async () => {
  const dir = await mkdtemp(join(tmpdir(), "dic-io-"));
  const target = join(dir, "bad.json");
  const circular = {};
  circular.self = circular;

  await assert.rejects(() => writeJsonAtomic(target, circular, { validateScope: false }), /circular/i);

  assert.equal(existsSync(target), false);
  assert.equal(existsSync(`${target}.tmp`), false);
  await rm(dir, { recursive: true, force: true });
});

test("writeJsonAtomic rejects paths outside the allowed write scope", async () => {
  const target = join(tmpdir(), "outside-dic-pipeline.json");

  await assert.rejects(
    () => writeJsonAtomic(target, { ok: true }),
    /\[TASK_BLOCKED: WRITE_SCOPE_VIOLATION\]/,
  );
});

test("writeJsonlAtomic writes one JSON object per line", async () => {
  const dir = await mkdtemp(join(tmpdir(), "dic-io-"));
  const target = join(dir, "records.jsonl");

  await writeJsonlAtomic(target, [{ uid: "a" }, { uid: "b" }], { validateScope: false });

  assert.equal(await readFile(target, "utf8"), '{"uid":"a"}\n{"uid":"b"}\n');
  assert.equal(existsSync(`${target}.tmp`), false);
  await rm(dir, { recursive: true, force: true });
});

test("writeJsonlAtomic rejects empty intermediate JSONL records", async () => {
  const dir = await mkdtemp(join(tmpdir(), "dic-io-"));
  const target = join(dir, "records.jsonl");

  await assert.rejects(
    () => writeJsonlAtomic(target, [{ uid: "a" }, null, { uid: "b" }], { validateScope: false }),
    /JSONL records must be objects/,
  );

  assert.equal(existsSync(target), false);
  assert.equal(existsSync(`${target}.tmp`), false);
  await rm(dir, { recursive: true, force: true });
});

test("listFilesDeterministic returns lexicographically sorted files", async () => {
  const dir = await mkdtemp(join(tmpdir(), "dic-io-"));
  await writeFile(join(dir, "b.txt"), "b");
  await writeFile(join(dir, "a.txt"), "a");
  await writeFile(join(dir, "c.txt"), "c");

  assert.deepEqual(await readdir(dir), await readdir(dir));
  assert.deepEqual(
    (await listFilesDeterministic(dir)).map((filePath) => filePath.split(/[\\/]/).at(-1)),
    ["a.txt", "b.txt", "c.txt"],
  );

  await rm(dir, { recursive: true, force: true });
});

test("sha256 helpers are reproducible", async () => {
  const dir = await mkdtemp(join(tmpdir(), "dic-io-"));
  const target = join(dir, "hash.txt");
  await writeFile(target, "same content");

  assert.equal(sha256Text("same content"), sha256Text("same content"));
  assert.equal(await sha256File(target), await sha256File(target));
  assert.notEqual(sha256Text("same content"), sha256Text("different content"));
  await rm(dir, { recursive: true, force: true });
});
