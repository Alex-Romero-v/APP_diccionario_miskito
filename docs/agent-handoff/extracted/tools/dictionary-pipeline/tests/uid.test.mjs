import assert from "node:assert/strict";
import test from "node:test";

import { createUidAllocator, slugifyUid } from "../src/normalize/slugify-uid.mjs";

test("slugifyUid creates deterministic searchable slugs", () => {
  assert.equal(slugifyUid("Bîla Tara!"), "bila-tara");
  assert.equal(slugifyUid("  Âiska  Wark  "), "aiska-wark");
});

test("UID allocator creates expected deterministic patterns", () => {
  const allocate = createUidAllocator();

  assert.equal(allocate.page(1), "page-p0001");
  assert.equal(allocate.block(10, 1), "block-p0010-b0001");
  assert.equal(allocate.entry(10, 1, "Abakaia"), "entry-p0010-b0001-abakaia");
  assert.equal(allocate.abbreviation(5, "v"), "abbreviation-p0005-v");
  assert.equal(allocate.reference(6, "db"), "reference-p0006-db");
  assert.equal(allocate.bibleBook(8, "Blasi Sturka"), "bible-book-p0008-blasi-sturka");
  assert.equal(allocate.phrase(328, 1, "Pain was!"), "phrase-p0328-b0001-pain-was");
  assert.equal(allocate.review(10, 7), "review-p0010-b0007");
});

test("UID allocator never uses UUIDs or timestamps and suffixes collisions", () => {
  const allocate = createUidAllocator();

  assert.equal(allocate.entry(10, 1, "Abakaia"), "entry-p0010-b0001-abakaia");
  assert.equal(allocate.entry(10, 1, "Abakaia"), "entry-p0010-b0001-abakaia-002");
  assert.equal(allocate.entry(10, 1, "Abakaia"), "entry-p0010-b0001-abakaia-003");
  assert.doesNotMatch(allocate.entry(10, 2, "Abakaia"), /\d{13}|[0-9a-f]{8}-[0-9a-f]{4}/i);
});
