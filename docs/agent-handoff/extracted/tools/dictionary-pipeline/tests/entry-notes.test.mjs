import assert from "node:assert/strict";
import test from "node:test";

import { parseEntryNotes } from "../src/parse/parse-entry-notes.mjs";

test("parseEntryNotes preserves bilingual raw notes", () => {
  const notes = parseEntryNotes("(Note/Nota: Used in commands / Usado en mandatos)", ["b1"]);

  assert.equal(notes.length, 1);
  assert.equal(notes[0].note_type, "usage");
  assert.equal(notes[0].note_text, "Used in commands / Usado en mandatos");
  assert.equal(notes[0].language, "bilingual");
  assert.deepEqual(notes[0].source_blocks, ["b1"]);
});
