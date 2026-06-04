import { normalizeText } from "./normalize-text.mjs";

export function slugifyUid(value) {
  return normalizeText(value)
    .normalized_text.replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function createUidAllocator() {
  const counts = new Map();

  function unique(baseUid) {
    const count = (counts.get(baseUid) ?? 0) + 1;
    counts.set(baseUid, count);
    return count === 1 ? baseUid : `${baseUid}-${String(count).padStart(3, "0")}`;
  }

  return {
    page(pageNumber) {
      return unique(`page-p${padPage(pageNumber)}`);
    },
    block(pageNumber, blockNumber) {
      return unique(`block-p${padPage(pageNumber)}-b${padBlock(blockNumber)}`);
    },
    entry(pageNumber, blockNumber, headword) {
      return unique(`entry-p${padPage(pageNumber)}-b${padBlock(blockNumber)}-${slugifyUid(headword)}`);
    },
    abbreviation(pageNumber, code) {
      return unique(`abbreviation-p${padPage(pageNumber)}-${slugifyUid(code)}`);
    },
    reference(pageNumber, code) {
      return unique(`reference-p${padPage(pageNumber)}-${slugifyUid(code)}`);
    },
    bibleBook(pageNumber, text) {
      return unique(`bible-book-p${padPage(pageNumber)}-${slugifyUid(text)}`);
    },
    phrase(pageNumber, blockNumber, text) {
      return unique(`phrase-p${padPage(pageNumber)}-b${padBlock(blockNumber)}-${slugifyUid(text)}`);
    },
    review(pageNumber, blockNumber) {
      return unique(`review-p${padPage(pageNumber)}-b${padBlock(blockNumber)}`);
    },
  };
}

function padPage(pageNumber) {
  return String(pageNumber).padStart(4, "0");
}

function padBlock(blockNumber) {
  return String(blockNumber).padStart(4, "0");
}
