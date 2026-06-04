import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import test from "node:test";

import { assertNoNetwork } from "../src/guards/assert-no-network.mjs";
import { assertNoPythonUsage } from "../src/guards/assert-no-python.mjs";
import { assertNodeRuntime } from "../src/guards/assert-node-runtime.mjs";
import { assertWriteScope } from "../src/guards/assert-write-scope.mjs";

const projectRoot = resolve(".");
const packageJsonPath = resolve(projectRoot, "package.json");
const cliPath = resolve(projectRoot, "tools/dictionary-pipeline/src/cli.mjs");

const requiredScripts = {
  "validate:env": "node tools/dictionary-pipeline/src/cli.mjs validate-env",
  "transcribe:init": "node tools/dictionary-pipeline/src/cli.mjs init",
  "transcribe:pages": "node tools/dictionary-pipeline/src/cli.mjs extract-pages",
  "transcribe:catalog": "node tools/dictionary-pipeline/src/cli.mjs parse-catalog",
  "transcribe:dictionary": "node tools/dictionary-pipeline/src/cli.mjs parse-dictionary",
  "transcribe:appendix": "node tools/dictionary-pipeline/src/cli.mjs parse-appendix",
  "transcribe:checksums": "node tools/dictionary-pipeline/src/cli.mjs checksums",
  "validate:transcription": "node tools/dictionary-pipeline/src/cli.mjs validate-transcription",
  test: "node --test tools/dictionary-pipeline/tests/**/*.test.mjs",
};

test("package.json declares module mode and required scripts", async () => {
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));

  assert.equal(packageJson.type, "module");

  for (const [scriptName, command] of Object.entries(requiredScripts)) {
    assert.equal(packageJson.scripts?.[scriptName], command);
  }
});

test("cli entrypoint exists", () => {
  assert.equal(existsSync(cliPath), true);
});

test("cli returns a controlled error for unknown commands", () => {
  const result = spawnSync(process.execPath, [cliPath, "unknown-command"], {
    cwd: projectRoot,
    encoding: "utf8",
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /\[TASK_BLOCKED: UNKNOWN_TASK: UNKNOWN_TASK\]/);
});

test("assert-node-runtime fails without a Node.js runtime", () => {
  assert.throws(
    () => assertNodeRuntime({ versions: {} }),
    /\[TRANSCRIPTION_BLOCKED: NODE_UNAVAILABLE\]/,
  );
});

test("assert-no-python detects prohibited command tokens", () => {
  for (const command of ["python", "python3", "pip", "poetry", "conda"]) {
    assert.throws(
      () => assertNoPythonUsage(command),
      /\[TASK_BLOCKED: T002: FORBIDDEN_PYTHON_USAGE\]/,
      command,
    );
  }
});

test("assert-no-network blocks environment and command network signals", () => {
  assert.throws(
    () => assertNoNetwork({ env: { TRANSCRIPTION_NETWORK_ALLOWED: "true" } }),
    /\[TASK_BLOCKED: T002: FORBIDDEN_NETWORK_USAGE\]/,
  );

  assert.throws(
    () => assertNoNetwork({ commands: ["node script.mjs --network"] }),
    /\[TASK_BLOCKED: T002: FORBIDDEN_NETWORK_USAGE\]/,
  );
});

test("assert-write-scope allows only authorized paths", () => {
  assert.doesNotThrow(() =>
    assertWriteScope(["tools/dictionary-pipeline/src/cli.mjs", "package.json"]),
  );

  assert.throws(
    () => assertWriteScope(["tools/dictionary-pipeline/input/source.pdf"]),
    /\[TASK_BLOCKED: WRITE_SCOPE_VIOLATION\]/,
  );

  assert.throws(
    () => assertWriteScope(["src/pipeline/build-db.js"]),
    /\[TASK_BLOCKED: WRITE_SCOPE_VIOLATION\]/,
  );
});

test("cli runs guards before permitted commands", () => {
  const result = spawnSync(process.execPath, [cliPath, "validate-env"], {
    cwd: projectRoot,
    encoding: "utf8",
    env: {
      ...process.env,
      TRANSCRIPTION_NETWORK_ALLOWED: "true",
    },
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /\[TASK_BLOCKED: T002: FORBIDDEN_NETWORK_USAGE\]/);
});
