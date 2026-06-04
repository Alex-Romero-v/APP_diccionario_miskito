import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import test from "node:test";

import { parseVerbTables } from "../src/parse/parse-verb-tables.mjs";

const verbTablesPath = "tools/dictionary-pipeline/intermediate/appendix/verb_tables.jsonl";

test("parseVerbTables writes traceable verb table rows", async () => {
  await rm(verbTablesPath, { force: true });
  const tables = await parseVerbTables();

  assert.equal(existsSync(verbTablesPath), true);
  assert.ok(tables.length > 0);

  const lines = (await readFile(verbTablesPath, "utf8")).trimEnd().split("\n");
  assert.equal(lines.length, tables.length);

  for (const line of lines) {
    const row = JSON.parse(line);
    for (const field of [
      "object_type",
      "table_uid",
      "row_uid",
      "columns",
      "raw_text",
      "source_page",
      "source_blocks",
      "verification_status",
      "extraction_confidence",
    ]) {
      assert.ok(field in row, field);
    }
    assert.equal(row.object_type, "verb_table_row");
    assert.ok(Array.isArray(row.columns));
    assert.ok(row.columns.length > 0);
    assert.equal(typeof row.raw_text, "string");
    assert.ok(row.raw_text.length > 0);
    assert.ok(row.source_page >= 298 && row.source_page <= 313);
    assert.ok(Array.isArray(row.source_blocks));
    assert.ok(row.source_blocks.length > 0);
  }
});

test("parseVerbTables preserves coordinates and marks ambiguous rows for review", async () => {
  const rows = await parseVerbTables();
  const withCoordinates = rows.find((row) => row.coordinates_used === true);
  const ambiguous = rows.find((row) => row.verification_status === "needs_review");

  assert.ok(withCoordinates);
  assert.ok(withCoordinates.columns.every((column) => "bbox" in column));
  assert.ok(ambiguous);
  assert.deepEqual(ambiguous.columns, [ambiguous.raw_text]);
});
