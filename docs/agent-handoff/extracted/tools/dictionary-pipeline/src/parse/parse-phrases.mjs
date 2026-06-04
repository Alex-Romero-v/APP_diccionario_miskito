import { readFile } from "node:fs/promises";

import { readJson } from "../io/read-json.mjs";
import { writeJsonlAtomic } from "../io/write-jsonl-atomic.mjs";
import { normalizePhrase } from "../normalize/normalize-phrase.mjs";

const phrasesPath = "tools/dictionary-pipeline/intermediate/appendix/phrases.jsonl";
const needsReviewPath = "tools/dictionary-pipeline/intermediate/review/needs_review.jsonl";

const phrasePages = [328, 329, 330];

export async function parsePhrases() {
  const phrases = [];
  const reviews = [];

  for (const pageNumber of phrasePages) {
    const page = await readJson(`tools/dictionary-pipeline/intermediate/pages/page_${String(pageNumber).padStart(4, "0")}.json`);
    const blocks = page.blocks
      .filter((block) => block.block_type !== "page_number" && block.block_type !== "appendix_heading")
      .sort((a, b) => a.reading_order - b.reading_order);

    for (let index = 0; index < blocks.length; index += 1) {
      const block = blocks[index];
      if (!isPhraseStart(block.text)) continue;

      const continuationBlocks = [];
      let cursor = index + 1;
      while (cursor < blocks.length && isContinuation(blocks[cursor])) {
        continuationBlocks.push(blocks[cursor]);
        cursor += 1;
      }

      const allBlocks = [block, ...continuationBlocks];
      const rawText = allBlocks.map((item) => item.text).join("\n");
      const parsed = splitPhrase(rawText);
      const normalized = normalizePhrase(parsed.phraseText);
      const needsReview = parsed.needsReview || continuationBlocks.length > 0;
      const phrase = {
        object_type: "phrase",
        uid: `phrase-p${String(pageNumber).padStart(4, "0")}-${String(block.reading_order).padStart(4, "0")}`,
        phrase_text: parsed.phraseText,
        normalized_phrase: normalized.normalized_phrase,
        english_text: parsed.englishText,
        spanish_text: parsed.spanishText,
        category: classifyPhrase(parsed.phraseText),
        source_page: pageNumber,
        source_blocks: allBlocks.map((item) => item.block_id),
        raw_text: rawText,
        confidence: needsReview ? 0.6 : 0.88,
        verification_status: needsReview ? "needs_review" : "parsed",
      };
      phrases.push(phrase);

      if (needsReview) {
        reviews.push({
          object_type: "review_item",
          uid: `review-${phrase.uid}`,
          source_page: pageNumber,
          source_blocks: phrase.source_blocks,
          raw_text: rawText,
          reason: "Phrase language separation or continuation is uncertain.",
          suggested_resolution: "Review phrase against source PDF without completing missing text.",
          blocking: false,
          verification_status: "needs_review",
        });
      }
    }
  }

  await writeJsonlAtomic(phrasesPath, phrases);
  await writeJsonlAtomic(needsReviewPath, await mergeReviewItems(reviews));
  return phrases;
}

function isPhraseStart(text) {
  return /(?:–|-)/.test(text) && !/^\(|^Note\/Nota/i.test(text);
}

function isContinuation(block) {
  if (!block?.text) return false;
  if (isPhraseStart(block.text)) return false;
  return block.bbox?.x > 45 || /^\(/.test(block.text);
}

function splitPhrase(rawText) {
  const normalizedRaw = rawText.replace(/\s+/g, " ").trim();
  const dashParts = normalizedRaw.split(/\s+(?:–|—|-)\s+/);
  if (dashParts.length < 2) {
    return { phraseText: normalizedRaw, englishText: "", spanishText: "", needsReview: true };
  }

  const phraseText = dashParts[0].trim();
  const gloss = dashParts.slice(1).join(" - ").trim();
  const languageParts = gloss.split(/\s+\/\s+/);
  if (languageParts.length < 2) {
    return { phraseText, englishText: gloss, spanishText: "", needsReview: true };
  }

  return {
    phraseText,
    englishText: languageParts[0].trim(),
    spanishText: languageParts.slice(1).join(" / ").trim(),
    needsReview: false,
  };
}

function classifyPhrase(phraseText) {
  if (/[!?]$/.test(phraseText) || /Naksa|Titan|Tutni|Welcome|Yamni/i.test(phraseText)) return "greeting";
  if (/Regards|Audi|Aihwa|Aluih|Aman/i.test(phraseText)) return "expression";
  return "phrase";
}

async function mergeReviewItems(newItems) {
  const existing = [];
  try {
    const text = await readFile(needsReviewPath, "utf8");
    for (const line of text.split(/\r?\n/)) {
      if (line.trim()) existing.push(JSON.parse(line));
    }
  } catch {
  }

  const byUid = new Map(existing.map((item) => [item.uid, item]));
  for (const item of newItems) byUid.set(item.uid, item);
  return [...byUid.values()].sort((a, b) => a.uid.localeCompare(b.uid));
}
