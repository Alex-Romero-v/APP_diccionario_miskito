import { normalizeHeadword } from "../normalize/normalize-headword.mjs";
import { createUidAllocator } from "../normalize/slugify-uid.mjs";

const allocate = createUidAllocator();

export function parseEntry(block) {
  const rawText = String(block.text ?? "").trim();
  const sourcePage = block.page_number;
  const blockNumber = Number(block.block_id.match(/b(\d{4})$/)?.[1] ?? 1);
  const segments = segmentRawEntry(rawText);
  const normalized = normalizeHeadword(segments.headword || rawText.split(/\s+/)[0] || "unknown");

  return {
    object_type: "dictionary_entry",
    uid: allocate.entry(sourcePage, blockNumber, normalized.headword),
    headword: normalized.headword,
    normalized_headword: normalized.normalized_headword,
    sort_key: normalized.sort_key,
    entry_type: block.block_type === "cross_reference" ? "cross_reference_only" : "main",
    parent_uid: null,
    parent_entry_uid: null,
    part_of_speech: normalizePartOfSpeech(segments.part_of_speech_segment),
    raw_part_of_speech: segments.part_of_speech_segment,
    source_page: sourcePage,
    source_blocks: [block.block_id],
    raw_text: rawText,
    segments,
    translations: [],
    variants: [],
    examples: [],
    notes: [],
    references: [],
    cross_references: [],
    flags: { has_examples: segments.example_segments.length > 0, has_notes: segments.note_segments.length > 0, has_variants: Boolean(segments.variant_segment) },
    verification_status: "parsed",
    extraction_confidence: 0.85,
  };
}

function segmentRawEntry(rawText) {
  const exampleSegments = /\(?Ex(?:\/Ej|Ej)?[:(]/i.test(rawText) ? [rawText] : [];
  const noteSegments = /\(?Note\/Nota:|\(?Note:|\(?Nota:/i.test(rawText) ? [rawText] : [];
  const crossReferenceSegments = /\bSee also\/?\s*Ver tambi[eé]n|\bSee also\b|\bVer tambi[eé]n\b/i.test(rawText) ? [rawText] : [];
  const beforeDash = rawText.split(/\s+[–—-]\s+/)[0] ?? rawText;
  const definitionSegment = rawText.includes("–") || rawText.includes("—") || / - /.test(rawText)
    ? rawText.replace(/^.*?\s+[–—-]\s+/, "")
    : "";
  const parens = [...beforeDash.matchAll(/\(([^)]*)\)/g)].map((match) => match[1]);
  const partOfSpeech = parens.findLast((text) => /^[a-z/-]+$/i.test(text)) ?? null;
  const variant = parens.find((text) => /a\/t:|Alt:|fs\/ea:/i.test(text)) ?? null;
  const headword = beforeDash.replace(/\([^)]*\)/g, "").trim();

  return {
    headword,
    variant_segment: variant,
    part_of_speech_segment: partOfSpeech,
    definition_segment: definitionSegment.trim(),
    example_segments: exampleSegments,
    note_segments: noteSegments,
    reference_segments: [],
    cross_reference_segments: crossReferenceSegments,
    raw_text: rawText,
  };
}

function normalizePartOfSpeech(raw) {
  if (raw === "v") return "verb";
  if (raw === "n/s") return "noun";
  return raw;
}
