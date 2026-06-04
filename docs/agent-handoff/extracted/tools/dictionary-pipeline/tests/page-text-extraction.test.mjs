import assert from "node:assert/strict";
import test from "node:test";

import { loadPdfSource } from "../src/pdf/load-pdf.mjs";
import { extractPageText } from "../src/pdf/extract-page-text.mjs";

test("extractPageText extracts native text and item metadata", async () => {
  const { pdf } = await loadPdfSource({ includeDocument: true });
  const page = await pdf.getPage(1);
  const extracted = await extractPageText(page, 1);

  assert.equal(extracted.page_number, 1);
  assert.equal(typeof extracted.raw_text, "string");
  assert.ok(extracted.raw_text.length > 0);
  assert.match(extracted.raw_text_sha256, /^[a-f0-9]{64}$/);
  assert.ok(extracted.items.length > 0);
  assert.equal(typeof extracted.items[0].str, "string");
  assert.equal(Array.isArray(extracted.items[0].transform), true);
  assert.equal(typeof extracted.items[0].width, "number");
  assert.equal(typeof extracted.items[0].height, "number");
  assert.ok("fontName" in extracted.items[0]);
});

test("extractPageText passes disableNormalization and includeMarkedContent to pdfjs", async () => {
  const calls = [];
  const page = {
    getTextContent(options) {
      calls.push(options);
      return {
        items: [
          { str: "Bîla", transform: [1, 0, 0, 1, 0, 0], width: 1, height: 1, fontName: "F1" },
        ],
      };
    },
  };

  await extractPageText(page, 1);

  assert.deepEqual(calls[0], { disableNormalization: true, includeMarkedContent: true });
});

test("extractPageText preserves original item order", async () => {
  const page = {
    getTextContent() {
      return {
        items: [
          { str: "first", transform: [1, 0, 0, 1, 0, 0], width: 1, height: 1, fontName: "F1" },
          { str: "second", transform: [1, 0, 0, 1, 0, 0], width: 1, height: 1, fontName: "F1" },
        ],
      };
    },
  };

  const extracted = await extractPageText(page, 10);

  assert.deepEqual(extracted.items.map((item) => item.str), ["first", "second"]);
  assert.equal(extracted.raw_text, "first\nsecond");
});

test("extractPageText blocks pages without native text", async () => {
  const page = {
    getTextContent() {
      return { items: [] };
    },
  };

  await assert.rejects(() => extractPageText(page, 1), /\[PAGE_BLOCKED: 1: PDF_TEXT_UNREADABLE\]/);
});

test("page 10 extraction preserves dictionary text and diacritics when present", async () => {
  const { pdf } = await loadPdfSource({ includeDocument: true });
  const page = await pdf.getPage(10);
  const extracted = await extractPageText(page, 10);

  assert.ok(extracted.raw_text.length > 0);
  assert.ok(extracted.items.length > 0);
  assert.equal(extracted.items.some((item) => /[âêîôûÂÊÎÔÛ]/.test(item.str)), true);
});
