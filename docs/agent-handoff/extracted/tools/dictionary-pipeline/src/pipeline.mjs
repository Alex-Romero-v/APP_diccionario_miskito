import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Database from "better-sqlite3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const DEFAULT_PDF = path.join(ROOT, "BYD Bila Yumhpa Diccionario Miskito dictionary 20 diciembre 2024.pdf");
const DEFAULT_OUT = path.join(ROOT, "tools", "dictionary-pipeline", "output");
const SOURCE_NAME = "BÎLA YUMHPA - MISKITU-ENGLISH-ESPAÑOL";

const POS_CODES = new Set([
  "1p", "2p", "3p", "adj", "adv", "conj", "construct", "exp", "fut",
  "int", "n/s", "n-agent/s-agente", "pos", "pres", "pron", "v",
  "v-imp", "v-intrans", "v-neg", "v-proh", "v-trans",
]);

const ABBR_CODES = [
  "n-agent/s-agente", "v-intrans", "v-trans", "construct", "v-proh",
  "v-neg", "v-imp", "fs/ea:", "a/t:", "Alt:", "Lit:", "n/s",
  "1p", "2p", "3p", "adj", "adv", "conj", "exp", "fut", "int",
  "pos", "pres", "pron", "v",
];

const ENGLISH_BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua",
  "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings",
  "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job",
  "Psalms", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah",
  "Jeremiah", "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel",
  "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk", "Zephaniah",
  "Haggai", "Zechariah", "Malachi", "Matthew", "Mark", "Luke", "John",
  "Acts", "Romans", "1 Corinthians", "2 Corinthians", "Galatians",
  "Ephesians", "Philippians", "Colossians", "1 Thessalonians",
  "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon",
  "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation",
].sort((a, b) => b.length - a.length);

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function nfc(value) {
  return String(value ?? "").normalize("NFC");
}

export function normalizeForSearch(value) {
  return nfc(value)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}\s?¡!¿;:,'".&/-]+/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSortKey(value) {
  return normalizeForSearch(value).replace(/[^\p{L}\p{N}]+/gu, "");
}

function sectionForPage(page) {
  if (page === 1) return "cover";
  if (page === 2) return "index";
  if (page === 3) return "dictionary_usage_note";
  if (page === 4) return "dictionary_note";
  if (page === 5) return "abbreviations";
  if (page >= 6 && page <= 7) return "references";
  if (page >= 8 && page <= 9) return "bible_books";
  if (page >= 10 && page <= 295) return "dictionary";
  if (page >= 296 && page <= 327) return "appendix";
  if (page >= 328) return "phrases";
  return "unknown";
}

function opText(arg) {
  if (!Array.isArray(arg)) return "";
  let out = "";
  for (const part of arg) {
    if (Array.isArray(part)) out += opText(part);
    else if (typeof part === "object" && part?.unicode !== undefined) out += part.unicode;
    else if (typeof part === "string") out += part;
  }
  return out;
}

async function colorChunksForPage(pdfjs, page) {
  const { OPS } = pdfjs;
  const list = await page.getOperatorList();
  let fill = "#000000";
  let fontName = null;
  let fontSize = null;
  let matrix = null;
  const chunks = [];
  for (let i = 0; i < list.fnArray.length; i++) {
    const fn = list.fnArray[i];
    const args = list.argsArray[i];
    if (fn === OPS.setFillRGBColor) fill = args?.[0] || fill;
    else if (fn === OPS.setFont) {
      fontName = args?.[0] ?? fontName;
      fontSize = args?.[1] ?? fontSize;
    } else if (fn === OPS.setTextMatrix) {
      matrix = args?.[0] ?? matrix;
    } else if (fn === OPS.showText) {
      chunks.push({
        text: opText(args?.[0] ?? []),
        color: fill,
        fontName,
        fontSize,
        x: matrix?.[4] ?? null,
        y: matrix?.[5] ?? null,
      });
    }
  }
  return chunks;
}

function matchColors(items, chunks) {
  let cursor = 0;
  return items.map((item) => {
    let color = "#000000";
    for (let i = cursor; i < chunks.length; i++) {
      const chunk = chunks[i];
      if (chunk.text === item.str || chunk.text.trim() === item.str.trim()) {
        color = chunk.color || color;
        cursor = i + 1;
        break;
      }
    }
    return color;
  });
}

function makeSpan(item, color, pageNumber, order) {
  const t = item.transform || [1, 0, 0, 1, 0, 0];
  const size = Math.abs(t[3] || item.height || 0);
  const text = nfc(item.str);
  const fontName = item.fontName || null;
  return {
    record_type: "span",
    page: pageNumber,
    span_order: order,
    text,
    x: Number(t[4]?.toFixed?.(3) ?? t[4] ?? 0),
    y: Number(t[5]?.toFixed?.(3) ?? t[5] ?? 0),
    width: Number((item.width ?? 0).toFixed(3)),
    height: Number((item.height ?? size ?? 0).toFixed(3)),
    font_name: fontName,
    font_size: Number(size.toFixed(3)),
    color,
    is_blue: color && color.toLowerCase() !== "#000000",
    is_probably_bold: fontName?.endsWith("_f2") || false,
    is_probably_italic: fontName?.endsWith("_f4") || false,
  };
}

function groupLines(spans) {
  const visible = spans
    .filter((s) => s.text !== "" && !/^\s+$/.test(s.text))
    .sort((a, b) => (b.y - a.y) || (a.x - b.x));
  const groups = [];
  for (const span of visible) {
    let group = groups.find((candidate) => Math.abs(candidate.y - span.y) <= 2.2);
    if (!group) {
      group = { y: span.y, spans: [] };
      groups.push(group);
    }
    group.spans.push(span);
    group.y = (group.y * (group.spans.length - 1) + span.y) / group.spans.length;
  }
  return groups
    .sort((a, b) => b.y - a.y)
    .map((group, index) => {
      const parts = group.spans.sort((a, b) => a.x - b.x);
      let text = "";
      let previous = null;
      for (const part of parts) {
        const chunk = part.text.replace(/\s+/g, " ");
        if (!chunk.trim()) continue;
        if (previous) {
          const gap = part.x - (previous.x + previous.width);
          const threshold = Math.max(1.5, Math.min(4.5, previous.font_size * 0.22));
          if (gap > threshold && !text.endsWith(" ")) text += " ";
        }
        text += chunk;
        previous = part;
      }
      return {
        line_order: index + 1,
        y: Number(group.y.toFixed(3)),
        min_x: Math.min(...parts.map((p) => p.x)),
        text: nfc(text.replace(/\s+/g, " ").trim()),
        has_blue: parts.some((p) => p.is_blue),
        spans: parts.map((p) => p.span_order),
        span_texts: parts.map((p) => p.text),
      };
    })
    .filter((line) => line.text.length > 0);
}

async function extractPdf(pdfPath, outDir) {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const doc = await pdfjs.getDocument({
    data,
    useWorkerFetch: false,
    isEvalSupported: false,
    disableFontFace: true,
  }).promise;

  const rawPages = [];
  const allSpans = [];
  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent({ includeMarkedContent: true });
    const items = content.items.filter((item) => item.str !== undefined);
    let colors = [];
    const warnings = [];
    try {
      colors = matchColors(items, await colorChunksForPage(pdfjs, page));
    } catch (error) {
      warnings.push(`style_color_extraction_failed:${error.message}`);
      colors = items.map(() => null);
    }
    const pageSpans = items.map((item, index) => makeSpan(item, colors[index], pageNumber, allSpans.length + index + 1));
    const lines = groupLines(pageSpans);
    const text = lines.map((line) => line.text).join("\n");
    const hasBlue = pageSpans.some((span) => span.is_blue);
    rawPages.push({
      record_type: "raw_page",
      page: pageNumber,
      section: sectionForPage(pageNumber),
      text: nfc(text),
      lines,
      warnings: hasBlue ? [...warnings, "blue_text_detected_on_page"] : warnings,
    });
    allSpans.push(...pageSpans);
    if (pageNumber % 25 === 0 || pageNumber === doc.numPages) {
      console.log(`extract ${pageNumber}/${doc.numPages}`);
    }
  }

  writeJsonl(path.join(outDir, "raw_pages.jsonl"), rawPages);
  writeJsonl(path.join(outDir, "spans.jsonl"), allSpans);
  return { rawPages, allSpans };
}

function writeJsonl(filePath, records) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(
    filePath,
    records.map((record) => JSON.stringify(record, null, 0)).join("\n") + "\n",
    "utf8",
  );
}

function writeJson(filePath, value) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function cleanLine(line) {
  return line.text
    .replace(/^\d+\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function contentLines(pageRecord) {
  return pageRecord.lines
    .filter((line) => {
      const text = cleanLine(line);
      if (!text) return false;
      if (/^\d+$/.test(text)) return false;
      if (/^(DICTIONARY|DICCIONARIO|APPENDIX|APÉNDICE|PHRASES,|EXPRESSIONS|GREETINGS)/i.test(text)) return false;
      if (/^Blue font indicates/i.test(text) || /^La fuente azul/i.test(text)) return false;
      return true;
    })
    .map((line) => ({ ...line, text: cleanLine(line) }));
}

function structuralDashIndex(text) {
  const dash = text.indexOf("–");
  return dash >= 0 ? dash : text.indexOf("â€“");
}

function structuralDashLength(text) {
  return text.indexOf("–") >= 0 ? 1 : 3;
}

function leftOfStructuralDash(text) {
  const dash = structuralDashIndex(text);
  return dash >= 0 ? text.slice(0, dash).trim() : "";
}

function isLikelyLemmaStart(text) {
  return /^[A-ZÁÉÍÓÚÂÊÎÔÛÑÜÃÂ¿0-9]/.test(text);
}

function isEntryStart(line, section) {
  const text = line.text;
  if (structuralDashIndex(text) < 0) return false;
  if (text.startsWith("(")) return false;
  if (/^(Note\/Nota|Lit:|See also\/Ver|Example\/Ejemplo|Examples\/Ejemplos)/i.test(text)) return false;
  const left = leftOfStructuralDash(text).replace(/\s+/g, " ").trim();
  if (!left || left.length > 140) return false;
  if (!isLikelyLemmaStart(left)) return false;
  if (section === "phrases") return line.min_x <= 90;
  return line.min_x <= 150;
}

export function splitEntryBlocks(rawPages) {
  const blocks = [];
  let current = null;
  let currentMainHeadword = null;
  for (const page of rawPages.filter((p) => ["dictionary", "phrases"].includes(p.section))) {
    for (const line of contentLines(page)) {
      if (isEntryStart(line, page.section)) {
        if (current) blocks.push(current);
        const isSubEntry = page.section === "dictionary" && line.min_x > 50;
        current = {
          section: page.section,
          source_page: page.page,
          source_page_end: page.page,
          lines: [line.text],
          line_span_ids: [...(line.spans || [])],
          start_x: line.min_x,
          parent_candidate_headword: isSubEntry ? currentMainHeadword : null,
          segmentation_confidence: line.min_x <= 110 ? "high" : "medium",
          has_blue: line.has_blue,
          crosses_page_boundary: false,
        };
        if (page.section === "dictionary" && !isSubEntry) {
          currentMainHeadword = leftOfStructuralDash(line.text)
            .replace(/\s*\([^)]*\)/g, " ")
            .replace(/\s+/g, " ")
            .trim();
        }
      } else if (current) {
        if (page.page !== current.source_page) current.crosses_page_boundary = true;
        current.source_page_end = page.page;
        current.lines.push(line.text);
        current.line_span_ids.push(...(line.spans || []));
        current.has_blue = current.has_blue || line.has_blue;
      } else if (page.section === "phrases" && structuralDashIndex(line.text) >= 0) {
        current = {
          section: page.section,
          source_page: page.page,
          source_page_end: page.page,
          lines: [line.text],
          line_span_ids: [...(line.spans || [])],
          start_x: line.min_x,
          parent_candidate_headword: null,
          segmentation_confidence: "medium",
          has_blue: line.has_blue,
          crosses_page_boundary: false,
        };
      }
    }
  }
  if (current) blocks.push(current);
  return blocks;
}

function splitOutsideParens(text, separator) {
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === "(") depth++;
    else if (char === ")" && depth > 0) depth--;
    else if (char === separator && depth === 0) return [text.slice(0, i), text.slice(i + 1)];
  }
  return [text, ""];
}

function extractParentheticalGroups(text) {
  const groups = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === "(") {
      if (depth === 0) start = i;
      depth++;
    } else if (text[i] === ")" && depth > 0) {
      depth--;
      if (depth === 0 && start >= 0) groups.push(text.slice(start + 1, i).trim());
    }
  }
  return groups;
}

function extractMarkedSegments(rawText, markerPattern) {
  const segments = [];
  const regex = new RegExp(markerPattern, "giu");
  let match;
  while ((match = regex.exec(rawText))) {
    const start = rawText.lastIndexOf("(", match.index);
    const segStart = start >= 0 && rawText.slice(start, match.index).trim() === "" ? start : match.index;
    let depth = 0;
    let end = rawText.length;
    for (let i = segStart; i < rawText.length; i++) {
      if (rawText[i] === "(") depth++;
      else if (rawText[i] === ")" && depth > 0) {
        depth--;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    segments.push(rawText.slice(segStart, end).trim());
  }
  return [...new Set(segments)];
}

function parseVariantsFromGroup(group) {
  const variants = [];
  const specs = [
    ["a/t:", "also_spelled"],
    ["fs/ea:", "former_spelling"],
    ["Alt:", "alternative"],
    ["short form / forma corta:", "short_form"],
  ];
  for (const [prefix, type] of specs) {
    if (group.toLowerCase().startsWith(prefix.toLowerCase())) {
      const rest = group.slice(prefix.length).trim();
      for (const item of rest.split(/[;,]/).map((x) => x.trim()).filter(Boolean)) {
        const sourceMatch = item.match(/^(.*?)-([a-z][a-z0-9]*)$/i);
        const variantText = sourceMatch ? sourceMatch[1].trim() : item;
        variants.push({
          variant_text: variantText,
          normalized_variant: normalizeForSearch(variantText),
          variant_type: sourceMatch ? "source_variant" : type,
          source_code: sourceMatch?.[2]?.toLowerCase() || null,
          raw_text: group,
        });
      }
    }
  }
  return variants;
}

function looksLikeReferenceGroup(group, referenceCodes) {
  if (!group) return false;
  if (/^(db|dba|dbta|dict|dictu|bw|mwb|lfb|hf|jw|tc|nkw)\b/i.test(group)) return true;
  return group
    .split(/[;,]/)
    .map((x) => x.trim().split(/[-\s]/)[0])
    .some((code) => referenceCodes.has(code.toLowerCase()));
}

function parseReferencesFromText(text, referenceCodes) {
  const refs = [];
  for (const group of extractParentheticalGroups(text)) {
    if (!looksLikeReferenceGroup(group, referenceCodes)) continue;
    for (const part of group.split(/[;,]/).map((x) => x.trim()).filter(Boolean)) {
      const negative = /not in\s*\/\s*no en/i.test(part);
      const cleaned = part.replace(/not in\s*\/\s*no en\s*:/i, "").trim();
      const match = cleaned.match(/^([a-z][a-z0-9]*)(?:[-\s](.*))?$/i);
      refs.push({
        reference_code: match?.[1]?.toLowerCase() || null,
        reference_detail: match?.[2] || null,
        raw_reference_text: part,
        negative_reference: negative,
      });
    }
  }
  return refs;
}

function parseExamples(rawText) {
  return extractMarkedSegments(rawText, "(Ex\\s*/\\s*Ej|ExEj|Example\\s*/\\s*Ejemplo|Examples\\s*/\\s*Ejemplos)").map((segment, index) => {
    const sourceMatch = segment.match(/Ex(?:\/Ej|Ej)?\s*\(([^)]+)\)/i);
    const body = segment
      .replace(/^\(/, "")
      .replace(/\)$/, "")
      .replace(/^(Ex\s*\/\s*Ej|ExEj|Example\s*\/\s*Ejemplo|Examples\s*\/\s*Ejemplos)\s*(\([^)]+\))?\s*:/i, "")
      .trim();
    const dash = structuralDashIndex(body);
    const miskitoPart = dash >= 0 ? body.slice(0, dash).trim() : body;
    const translationPart = dash >= 0 ? body.slice(dash + structuralDashLength(body)).trim() : "";
    const [english, spanish] = splitOutsideParens(translationPart || "", "/").map((x) => x.trim());
    return {
      miskito: miskitoPart || null,
      english: english || null,
      spanish: spanish || null,
      source_code: sourceMatch?.[1]?.trim().split(/[-\s]/)[0] || null,
      source_detail: sourceMatch?.[1]?.trim() || null,
      order: index + 1,
      is_literal_translation: true,
      raw_text: segment,
    };
  });
}

function parseNotes(rawText) {
  const notes = [];
  const specs = [
    ["Note/Nota", "usage", "(Note\\s*/\\s*Nota\\s*:)"],
    ["Lit", "literal", "(Lit\\s*:)"],
    ["See also/Ver también", "see_also", "(See\\s+also\\s*/\\s*Ver\\s+tambi[eé]n\\s*:)"],
    ["see/ver", "cross_reference", "(see\\s*/\\s*ver\\s*:)"],
  ];
  for (const [, noteType, pattern] of specs) {
    for (const segment of extractMarkedSegments(rawText, pattern)) {
      const noteText = segment
        .replace(/^\(/, "")
        .replace(/\)$/, "")
        .replace(new RegExp(pattern, "iu"), "")
        .trim();
      notes.push({
        note_type: noteType,
        note_text: noteText,
        note_order: notes.length + 1,
        raw_text: segment,
      });
    }
  }
  const existing = new Set(notes.map((note) => note.raw_text));
  for (const group of extractParentheticalGroups(rawText)) {
    let noteType = null;
    if (/^Construct\s*:/i.test(group)) noteType = "construct";
    else if (/^(trans|intrans)\s*:/i.test(group)) noteType = "grammar";
    else if (/^short form\s*\/\s*forma corta\s*:/i.test(group)) noteType = "spelling";
    else if (/^(of|de)\s*:/i.test(group)) noteType = "source";
    if (!noteType) continue;
    const raw = `(${group})`;
    if (existing.has(raw)) continue;
    notes.push({
      note_type: noteType,
      note_text: group,
      note_order: notes.length + 1,
      raw_text: raw,
    });
    existing.add(raw);
  }
  return notes;
}

function parseCrossReferences(notes) {
  const out = [];
  for (const note of notes.filter((n) => ["see_also", "cross_reference"].includes(n.note_type))) {
    for (const target of note.note_text.split(/[;&,]/).map((x) => x.trim()).filter(Boolean)) {
      out.push({
        target_headword: target,
        normalized_target_headword: normalizeForSearch(target),
        relation_type: note.note_type,
        raw_text: note.raw_text,
      });
    }
  }
  return out;
}

export function parseEntryBlock(block, sourceOrder, referenceCodes = new Set()) {
  const rawText = nfc(block.lines.join("\n"));
  const warnings = [];
  const firstDash = structuralDashIndex(rawText);
  let left = rawText;
  let definition = "";
  if (firstDash >= 0) {
    left = rawText.slice(0, firstDash).trim();
    definition = rawText.slice(firstDash + structuralDashLength(rawText)).trim();
  } else {
    warnings.push("missing_structural_dash");
  }

  const leftGroups = extractParentheticalGroups(left);
  let headwordPart = left.replace(/\s*\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  let homograph = null;
  const homographMatch = left.match(/^(.*?)\s*\((\d+)\)/);
  if (homographMatch) {
    headwordPart = homographMatch[1].trim();
    homograph = Number(homographMatch[2]);
  }
  if (!headwordPart) {
    headwordPart = left.split("(")[0].trim();
    warnings.push("headword_low_confidence");
  }

  const pos = [];
  const variants = [];
  const references = parseReferencesFromText(rawText, referenceCodes);
  for (const group of leftGroups) {
    const posCandidate = group.replace(/\s+/g, "").split(",").map((x) => x.trim()).filter(Boolean);
    if (posCandidate.length && posCandidate.every((code) => POS_CODES.has(code))) {
      pos.push(...posCandidate);
      continue;
    }
    const parsedVariants = parseVariantsFromGroup(group);
    if (parsedVariants.length) {
      variants.push(...parsedVariants);
      continue;
    }
    if (homographMatch && group === String(homograph)) continue;
    if (looksLikeReferenceGroup(group, referenceCodes)) continue;
    if (!/[/:;]/.test(group) && group.length <= 80) {
      variants.push({
        variant_text: group,
        normalized_variant: normalizeForSearch(group),
        variant_type: "no_diacritic",
        source_code: null,
        raw_text: group,
      });
    }
  }

  const examples = parseExamples(rawText);
  const notes = parseNotes(rawText);
  const crossReferences = parseCrossReferences(notes);
  const mainDefinition = definition
    .split(/\s+\((?:Ex\s*\/\s*Ej|ExEj|Example\s*\/\s*Ejemplo|Examples\s*\/\s*Ejemplos|Note\s*\/\s*Nota|Lit:|See\s+also\s*\/\s*Ver)/iu)[0]
    .trim();
  let english = null;
  let spanish = null;
  if (mainDefinition) {
    const split = splitOutsideParens(mainDefinition, "/");
    english = split[0]?.trim() || null;
    spanish = split[1]?.trim() || null;
    if (!spanish) warnings.push("missing_spanish_translation_separator");
  } else {
    warnings.push("empty_definition");
  }

  if (block.parent_candidate_headword && block.section === "dictionary") {
    warnings.push("parent_candidate_requires_review");
  }

  let confidence = "high";
  let verificationStatus = "verified";
  if (block.has_blue) {
    confidence = "low";
    verificationStatus = "blue_unverified";
    warnings.push("blue_text_requires_verification");
  } else if (warnings.length) {
    confidence = warnings.some((warning) => warning.startsWith("missing")) ? "low" : "medium";
    verificationStatus = confidence === "low" ? "needs_manual_review" : "pending";
  }

  const entryType = block.section === "phrases"
    ? "phrase"
    : block.start_x > 50
      ? "sub_entry"
      : "main_entry";

  return {
    record_type: "entry",
    entry_type: entryType,
    source: {
      dictionary_name: SOURCE_NAME,
      source_page: block.source_page,
      source_page_end: block.source_page_end === block.source_page ? null : block.source_page_end,
      source_section: block.section,
      source_order: sourceOrder,
      raw_text: rawText,
      raw_unparsed_parts: [],
      line_span_ids: block.line_span_ids || [],
    },
    parent_candidate_headword: block.parent_candidate_headword || null,
    segmentation_confidence: block.segmentation_confidence || "medium",
    headword: {
      display: headwordPart,
      normalized: normalizeForSearch(headwordPart),
      sort_key: normalizeSortKey(headwordPart),
      homograph_number: homograph,
    },
    grammar: {
      part_of_speech: [...new Set(pos)],
      raw_part_of_speech: pos.length ? [...new Set(pos)].join(",") : null,
      grammar_labels: [],
      construct_info: null,
    },
    translations: english || spanish ? [{
      english,
      spanish,
      order: 1,
      is_literal: false,
      raw_text: mainDefinition,
    }] : [],
    variants,
    examples,
    notes,
    references,
    cross_references: crossReferences,
    format_flags: {
      has_blue_unverified_text: Boolean(block.has_blue),
      has_small_no_diacritic_variant: variants.some((v) => v.variant_type === "no_diacritic"),
      has_italic_text: false,
      has_bold_headword: true,
      has_table_origin: false,
      crosses_page_boundary: Boolean(block.crosses_page_boundary),
    },
    quality: {
      verification_status: verificationStatus,
      extraction_confidence: confidence,
      warnings: [...new Set(warnings)],
    },
  };
}

function extractAbbreviations(rawPages) {
  const page = rawPages.find((p) => p.page === 5);
  if (!page) return [];
  const records = [];
  for (const line of contentLines(page)) {
    if (/ABBREVIATIONS|ABREVIATURAS/i.test(line.text)) continue;
    const code = ABBR_CODES.find((candidate) => line.text.startsWith(candidate + " ") || line.text === candidate);
    if (!code) continue;
    const rest = line.text.slice(code.length).replace(/^[:\s-]+/, "").trim();
    const [english, spanish] = splitOutsideParens(rest, "/").map((x) => x.trim());
    records.push({
      record_type: "abbreviation",
      code: code.replace(/:$/, ""),
      english: english || null,
      spanish: spanish || null,
      source_page: 5,
      raw_text: line.text,
    });
  }
  return records;
}

function extractReferences(rawPages) {
  const text = rawPages
    .filter((p) => p.section === "references")
    .flatMap((p) => contentLines(p).map((line) => ({ ...line, page: p.page })));
  const joined = text.map((line) => line.text).join(" ");
  const records = [];
  const regex = /\b([a-z][a-z0-9]{0,8})\s*-\s*/gi;
  const matches = [...joined.matchAll(regex)];
  for (let i = 0; i < matches.length; i++) {
    const code = matches[i][1].toLowerCase();
    if (["pg", "pág"].includes(code)) continue;
    const start = matches[i].index + matches[i][0].length;
    const end = i + 1 < matches.length ? matches[i + 1].index : joined.length;
    const rawDescription = joined.slice(start, end).replace(/\s*;\s*$/, "").trim();
    if (!rawDescription || rawDescription.length < 3) continue;
    const [descriptionEn, descriptionEs] = splitOutsideParens(rawDescription, "/").map((x) => x.trim());
    records.push({
      record_type: "reference",
      code,
      description_en: descriptionEn || rawDescription,
      description_es: descriptionEs || null,
      source_page: code === "bw" || code.startsWith("db") ? 7 : 6,
      raw_text: `${code} - ${rawDescription}`,
    });
  }
  return records;
}

function parseBibleLine(rawText) {
  const english = ENGLISH_BIBLE_BOOKS.find((book) => rawText.includes(` ${book} `) || rawText.endsWith(` ${book}`));
  if (!english) return null;
  const englishIndex = rawText.indexOf(english);
  const before = rawText.slice(0, englishIndex).trim();
  const spanish = rawText.slice(englishIndex + english.length).trim();
  const abbrevMatch = before.match(/^(.*)\s+([1-3]?[A-ZÁÉÍÓÚÑ][A-Za-zÁÉÍÓÚÑáéíóúñ.]+\.?)$/);
  return {
    miskito: abbrevMatch?.[1]?.trim() || before,
    tnatka_prahni: abbrevMatch?.[2]?.trim() || null,
    english,
    spanish: spanish || null,
  };
}

function extractBibleBooks(rawPages) {
  const records = [];
  for (const page of rawPages.filter((p) => p.section === "bible_books")) {
    let testament = page.page === 8 ? "HIBRU ULBANKA NANI" : "GRIK ULBANKA NANI";
    for (const line of contentLines(page)) {
      if (/HIBRU ULBANKA|GRIK ULBANKA/i.test(line.text)) {
        testament = line.text;
        continue;
      }
      if (/Miskito\s+Tnatka/i.test(line.text)) continue;
      const parsed = parseBibleLine(line.text);
      if (!parsed) continue;
      records.push({
        record_type: "bible_book",
        testament,
        source_page: page.page,
        raw_text: line.text,
        ...parsed,
      });
    }
  }
  return records;
}

function extractGrammar(rawPages) {
  const records = [];
  let order = 0;
  const tablePages = new Set([298, 299, 300, 301, 302, 303, 323]);
  for (const page of rawPages.filter((p) => p.section === "appendix")) {
    for (const line of contentLines(page)) {
      if (/^Pg\.|^pág\.|^Miskito\s+/i.test(line.text)) continue;
      order++;
      const hasTableOrigin = tablePages.has(page.page) || /TABLE|TABLA/i.test(line.text);
      const kind = hasTableOrigin ? "verb_table"
        : /PRONUNCIATION|PRONUNCIACIÓN/i.test(line.text) ? "pronunciation_note"
        : /NUMBER|NÚMERO|YEAR|AÑO/i.test(line.text) ? "number_entry"
        : /FORM|FORMA|VERB|NOUN|SUSTANTIVO/i.test(line.text) ? "grammar_rule"
        : "grammar_section";
      const tableCells = hasTableOrigin
        ? (line.span_texts || [line.text]).map((x) => String(x).trim()).filter(Boolean)
        : [];
      records.push({
        record_type: "grammar",
        grammar_type: kind,
        has_table_origin: hasTableOrigin,
        table_cells: tableCells,
        source_page: page.page,
        source_order: order,
        raw_text: line.text,
        text: line.text,
        quality: {
          extraction_confidence: line.has_blue ? "low" : "medium",
          warnings: line.has_blue ? ["blue_text_requires_verification"] : [],
        },
      });
    }
  }
  return records;
}

function parseEntries(rawPages, references) {
  const referenceCodes = new Set(references.map((record) => record.code));
  return splitEntryBlocks(rawPages).map((block, index) => parseEntryBlock(block, index + 1, referenceCodes));
}

function makeReviewRows(entries, grammar) {
  const rows = [];
  for (const entry of entries) {
    if (entry.quality.extraction_confidence === "high" && !entry.quality.warnings.length) continue;
    rows.push({
      record_type: "entry",
      review_status: "pending",
      review_decision: "",
      corrected_text: "",
      reviewer_notes: "",
      source_page: entry.source.source_page,
      source_order: entry.source.source_order,
      key: entry.headword.display,
      confidence: entry.quality.extraction_confidence,
      warnings: entry.quality.warnings.join(";"),
      raw_text: entry.source.raw_text.replace(/\n/g, "\\n"),
    });
  }
  for (const record of grammar) {
    if (record.quality.extraction_confidence !== "low" && !record.quality.warnings.length) continue;
    rows.push({
      record_type: "grammar",
      review_status: "pending",
      review_decision: "",
      corrected_text: "",
      reviewer_notes: "",
      source_page: record.source_page,
      source_order: record.source_order,
      key: record.grammar_type,
      confidence: record.quality.extraction_confidence,
      warnings: record.quality.warnings.join(";"),
      raw_text: record.raw_text.replace(/\n/g, "\\n"),
    });
  }
  return rows;
}

function csvEscape(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function writeReviewCsv(filePath, rows) {
  const header = [
    "record_type", "review_status", "review_decision", "corrected_text",
    "reviewer_notes", "source_page", "source_order", "key", "confidence",
    "warnings", "raw_text",
  ];
  const lines = [header.join(",")];
  for (const row of rows) lines.push(header.map((key) => csvEscape(row[key])).join(","));
  fs.writeFileSync(filePath, lines.join("\n") + "\n", "utf8");
}

function buildSqlite(outDir, records) {
  const dbPath = path.join(outDir, "dictionary.db");
  if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);
  const db = new Database(dbPath);
  db.pragma("foreign_keys = ON");
  db.exec(`
    CREATE TABLE metadata (key TEXT PRIMARY KEY, value TEXT NOT NULL);
    CREATE TABLE entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      headword TEXT,
      normalized_headword TEXT,
      sort_key TEXT,
      entry_type TEXT NOT NULL,
      parent_entry_id INTEGER,
      parent_candidate_headword TEXT,
      segmentation_confidence TEXT NOT NULL,
      line_span_ids TEXT,
      part_of_speech TEXT,
      raw_part_of_speech TEXT,
      source_page INTEGER NOT NULL,
      source_page_end INTEGER,
      raw_text TEXT NOT NULL,
      verification_status TEXT NOT NULL,
      extraction_confidence TEXT NOT NULL,
      warnings TEXT,
      has_examples INTEGER NOT NULL DEFAULT 0,
      has_notes INTEGER NOT NULL DEFAULT 0,
      has_variants INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE translations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
      spanish_text TEXT,
      english_text TEXT,
      translation_order INTEGER NOT NULL,
      is_literal INTEGER NOT NULL DEFAULT 0,
      raw_text TEXT
    );
    CREATE TABLE variants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
      variant_text TEXT NOT NULL,
      normalized_variant TEXT NOT NULL,
      variant_type TEXT NOT NULL,
      source_code TEXT,
      raw_text TEXT
    );
    CREATE TABLE examples (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
      miskito_text TEXT,
      spanish_text TEXT,
      english_text TEXT,
      source_code TEXT,
      source_detail TEXT,
      example_order INTEGER NOT NULL,
      is_literal_translation INTEGER NOT NULL DEFAULT 1,
      raw_text TEXT NOT NULL
    );
    CREATE TABLE notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
      note_type TEXT NOT NULL,
      note_text TEXT NOT NULL,
      note_order INTEGER NOT NULL,
      raw_text TEXT
    );
    CREATE TABLE "references" (
      code TEXT PRIMARY KEY,
      description_en TEXT,
      description_es TEXT,
      source_page INTEGER,
      raw_text TEXT
    );
    CREATE TABLE entry_references (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE,
      reference_code TEXT,
      reference_detail TEXT,
      raw_reference_text TEXT,
      negative_reference INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE cross_references (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER NOT NULL REFERENCES entries(id) ON DELETE CASCADE,
      target_headword TEXT NOT NULL,
      normalized_target_headword TEXT NOT NULL,
      relation_type TEXT NOT NULL,
      raw_text TEXT
    );
    CREATE TABLE abbreviations (
      code TEXT PRIMARY KEY,
      english TEXT,
      spanish TEXT,
      source_page INTEGER,
      raw_text TEXT
    );
    CREATE TABLE bible_books (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      testament TEXT,
      miskito TEXT,
      tnatka_prahni TEXT,
      english TEXT,
      spanish TEXT,
      source_page INTEGER,
      raw_text TEXT
    );
    CREATE TABLE grammar (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      grammar_type TEXT,
      has_table_origin INTEGER NOT NULL DEFAULT 0,
      table_cells TEXT,
      source_page INTEGER,
      source_order INTEGER,
      text TEXT,
      raw_text TEXT,
      extraction_confidence TEXT,
      warnings TEXT
    );
    CREATE TABLE phrases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER,
      phrase_text TEXT NOT NULL,
      normalized_phrase TEXT NOT NULL,
      spanish_text TEXT,
      english_text TEXT,
      category TEXT,
      source_page INTEGER NOT NULL,
      raw_text TEXT NOT NULL,
      extraction_confidence TEXT NOT NULL
    );
    CREATE TABLE favorites (id INTEGER PRIMARY KEY AUTOINCREMENT, entry_id INTEGER NOT NULL, created_at TEXT NOT NULL);
    CREATE TABLE history (id INTEGER PRIMARY KEY AUTOINCREMENT, entry_id INTEGER NOT NULL, opened_at TEXT NOT NULL);
    CREATE VIRTUAL TABLE search_index USING fts4(
      entry_id UNINDEXED,
      headword,
      normalized_headword,
      variants_text,
      spanish_text,
      english_text,
      examples_text,
      notes_text
    );
    CREATE INDEX idx_entries_headword ON entries(headword);
    CREATE INDEX idx_entries_normalized ON entries(normalized_headword);
    CREATE INDEX idx_variants_normalized ON variants(normalized_variant);
  `);

  const insertEntry = db.prepare(`
    INSERT INTO entries (
      headword, normalized_headword, sort_key, entry_type, parent_entry_id,
      parent_candidate_headword, segmentation_confidence, line_span_ids,
      part_of_speech, raw_part_of_speech, source_page, source_page_end, raw_text,
      verification_status, extraction_confidence, warnings, has_examples, has_notes, has_variants
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertTranslation = db.prepare(`
    INSERT INTO translations (entry_id, spanish_text, english_text, translation_order, is_literal, raw_text)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertVariant = db.prepare(`
    INSERT INTO variants (entry_id, variant_text, normalized_variant, variant_type, source_code, raw_text)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const insertExample = db.prepare(`
    INSERT INTO examples (
      entry_id, miskito_text, spanish_text, english_text, source_code,
      source_detail, example_order, is_literal_translation, raw_text
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertNote = db.prepare(`
    INSERT INTO notes (entry_id, note_type, note_text, note_order, raw_text)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertEntryRef = db.prepare(`
    INSERT INTO entry_references (entry_id, reference_code, reference_detail, raw_reference_text, negative_reference)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertCrossRef = db.prepare(`
    INSERT INTO cross_references (entry_id, target_headword, normalized_target_headword, relation_type, raw_text)
    VALUES (?, ?, ?, ?, ?)
  `);
  const insertPhrase = db.prepare(`
    INSERT INTO phrases (
      entry_id, phrase_text, normalized_phrase, spanish_text, english_text,
      category, source_page, raw_text, extraction_confidence
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertSearch = db.prepare(`
    INSERT INTO search_index (
      entry_id, headword, normalized_headword, variants_text, spanish_text, english_text, examples_text, notes_text
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const tx = db.transaction(() => {
    for (const ref of records.references) {
      db.prepare(`INSERT OR REPLACE INTO "references" VALUES (?, ?, ?, ?, ?)`)
        .run(ref.code, ref.description_en, ref.description_es, ref.source_page, ref.raw_text);
    }
    for (const abbr of records.abbreviations) {
      db.prepare("INSERT OR REPLACE INTO abbreviations VALUES (?, ?, ?, ?, ?)")
        .run(abbr.code, abbr.english, abbr.spanish, abbr.source_page, abbr.raw_text);
    }
    for (const book of records.bibleBooks) {
      db.prepare(`
        INSERT INTO bible_books (testament, miskito, tnatka_prahni, english, spanish, source_page, raw_text)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(book.testament, book.miskito, book.tnatka_prahni, book.english, book.spanish, book.source_page, book.raw_text);
    }
    for (const grammar of records.grammar) {
      db.prepare(`
        INSERT INTO grammar (grammar_type, has_table_origin, table_cells, source_page, source_order, text, raw_text, extraction_confidence, warnings)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        grammar.grammar_type,
        grammar.has_table_origin ? 1 : 0,
        JSON.stringify(grammar.table_cells || []),
        grammar.source_page,
        grammar.source_order,
        grammar.text,
        grammar.raw_text,
        grammar.quality.extraction_confidence,
        grammar.quality.warnings.join(";"),
      );
    }
    for (const entry of records.entries) {
      const info = insertEntry.run(
        entry.headword.display,
        entry.headword.normalized,
        entry.headword.sort_key,
        entry.entry_type,
        null,
        entry.parent_candidate_headword,
        entry.segmentation_confidence,
        JSON.stringify(entry.source.line_span_ids || []),
        entry.grammar.part_of_speech.join(","),
        entry.grammar.raw_part_of_speech,
        entry.source.source_page,
        entry.source.source_page_end,
        entry.source.raw_text,
        entry.quality.verification_status,
        entry.quality.extraction_confidence,
        entry.quality.warnings.join(";"),
        entry.examples.length ? 1 : 0,
        entry.notes.length ? 1 : 0,
        entry.variants.length ? 1 : 0,
      );
      const entryId = info.lastInsertRowid;
      const spanishParts = [];
      const englishParts = [];
      const variantParts = [];
      const exampleParts = [];
      const noteParts = [];
      for (const tr of entry.translations) {
        insertTranslation.run(entryId, tr.spanish, tr.english, tr.order, tr.is_literal ? 1 : 0, tr.raw_text);
        spanishParts.push(tr.spanish);
        englishParts.push(tr.english);
      }
      for (const variant of entry.variants) {
        insertVariant.run(entryId, variant.variant_text, variant.normalized_variant, variant.variant_type, variant.source_code, variant.raw_text);
        variantParts.push(variant.variant_text, variant.normalized_variant);
      }
      for (const ex of entry.examples) {
        insertExample.run(entryId, ex.miskito, ex.spanish, ex.english, ex.source_code, ex.source_detail, ex.order, ex.is_literal_translation ? 1 : 0, ex.raw_text);
        exampleParts.push(ex.miskito, ex.spanish, ex.english);
      }
      for (const note of entry.notes) {
        insertNote.run(entryId, note.note_type, note.note_text, note.note_order, note.raw_text);
        noteParts.push(note.note_text);
      }
      for (const ref of entry.references) {
        insertEntryRef.run(entryId, ref.reference_code, ref.reference_detail, ref.raw_reference_text, ref.negative_reference ? 1 : 0);
      }
      for (const cross of entry.cross_references) {
        insertCrossRef.run(entryId, cross.target_headword, cross.normalized_target_headword, cross.relation_type, cross.raw_text);
      }
      if (entry.entry_type === "phrase") {
        const tr = entry.translations[0] || {};
        insertPhrase.run(entryId, entry.headword.display, entry.headword.normalized, tr.spanish, tr.english, "phrase", entry.source.source_page, entry.source.raw_text, entry.quality.extraction_confidence);
      }
      insertSearch.run(
        entryId,
        entry.headword.display || "",
        entry.headword.normalized || "",
        variantParts.filter(Boolean).join(" "),
        spanishParts.filter(Boolean).join(" "),
        englishParts.filter(Boolean).join(" "),
        exampleParts.filter(Boolean).join(" "),
        noteParts.filter(Boolean).join(" "),
      );
    }
    const metadata = {
      dictionary_name: SOURCE_NAME,
      database_version: "1",
      source_pdf: path.basename(DEFAULT_PDF),
      pages_count: String(records.rawPages.length),
      entries_count: String(records.entries.length),
      generated_at: new Date().toISOString(),
    };
    for (const [key, value] of Object.entries(metadata)) {
      db.prepare("INSERT INTO metadata(key, value) VALUES (?, ?)").run(key, value);
    }
  });
  tx();
  db.close();
  return dbPath;
}

function validateSqlite(dbPath) {
  const db = new Database(dbPath, { readonly: true });
  const requiredTables = [
    "metadata", "entries", "translations", "variants", "examples", "notes",
    "references", "entry_references", "cross_references", "search_index",
    "phrases", "favorites", "history", "abbreviations", "bible_books", "grammar",
  ];
  const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type IN ('table','virtual table')").all().map((row) => row.name));
  const missing = requiredTables.filter((name) => !tables.has(name));
  if (missing.length) throw new Error(`missing tables: ${missing.join(", ")}`);
  const entriesCount = db.prepare("SELECT COUNT(*) AS c FROM entries").get().c;
  if (entriesCount <= 0) throw new Error("entries table is empty");
  const missingRaw = db.prepare("SELECT COUNT(*) AS c FROM entries WHERE raw_text IS NULL OR trim(raw_text) = ''").get().c;
  if (missingRaw) throw new Error(`entries without raw_text: ${missingRaw}`);
  const badPages = db.prepare("SELECT COUNT(*) AS c FROM entries WHERE source_page IS NULL OR source_page <= 0").get().c;
  if (badPages) throw new Error(`entries without valid source_page: ${badPages}`);
  const ftsCount = db.prepare("SELECT COUNT(*) AS c FROM search_index").get().c;
  if (ftsCount !== entriesCount) throw new Error("search_index count does not match entries count");
  const subentries = db.prepare("SELECT COUNT(*) AS c FROM entries WHERE entry_type = 'sub_entry'").get().c;
  if (subentries <= 0) throw new Error("sub_entry classification is empty");
  const abbrCount = db.prepare("SELECT COUNT(*) AS c FROM abbreviations").get().c;
  if (abbrCount !== 25) throw new Error(`abbreviations count mismatch: ${abbrCount}`);
  const bibleCount = db.prepare("SELECT COUNT(*) AS c FROM bible_books").get().c;
  if (bibleCount !== 66) throw new Error(`bible book count mismatch: ${bibleCount}`);
  const favorites = db.prepare("SELECT COUNT(*) AS c FROM favorites").get().c;
  const history = db.prepare("SELECT COUNT(*) AS c FROM history").get().c;
  if (favorites !== 0 || history !== 0) throw new Error("favorites/history must be empty in distributed database");
  db.close();
  return {
    status: "ok",
    entries_count: entriesCount,
    subentries_count: subentries,
    search_index_count: ftsCount,
    abbreviations_count: abbrCount,
    bible_books_count: bibleCount,
  };
}

function buildReport(outDir, records, validation) {
  const entries = records.entries;
  const reviewRows = records.reviewRows;
  const confidenceCount = (level) => entries.filter((entry) => entry.quality.extraction_confidence === level).length;
  const pageProblems = new Set();
  for (const page of records.rawPages) {
    if (page.warnings?.length) pageProblems.add(page.page);
  }
  for (const row of reviewRows) pageProblems.add(row.source_page);
  return {
    source_pdf: DEFAULT_PDF,
    generated_at: new Date().toISOString(),
    total_pages_processed: records.rawPages.length,
    total_entries_detected: entries.length,
    total_main_entries: entries.filter((entry) => entry.entry_type === "main_entry").length,
    total_subentries: entries.filter((entry) => entry.entry_type === "sub_entry").length,
    total_phrases: entries.filter((entry) => entry.entry_type === "phrase").length,
    total_notes: entries.reduce((sum, entry) => sum + entry.notes.length, 0),
    total_examples: entries.reduce((sum, entry) => sum + entry.examples.length, 0),
    total_variants: entries.reduce((sum, entry) => sum + entry.variants.length, 0),
    total_references: records.references.length,
    total_entry_reference_links: entries.reduce((sum, entry) => sum + entry.references.length, 0),
    total_abbreviations: records.abbreviations.length,
    total_bible_books: records.bibleBooks.length,
    total_grammar_records: records.grammar.length,
    total_high_confidence_records: confidenceCount("high"),
    total_medium_confidence_records: confidenceCount("medium"),
    total_low_confidence_records: confidenceCount("low"),
    total_manual_review_records: reviewRows.length,
    manual_review_workflow: {
      status_values: ["pending", "accepted", "corrected", "rejected"],
      default_status: "pending",
      pending_records: reviewRows.filter((row) => row.review_status === "pending").length,
    },
    pages_with_extraction_warnings_or_review: [...pageProblems].sort((a, b) => a - b),
    entries_crossing_pages: entries
      .filter((entry) => entry.format_flags.crosses_page_boundary)
      .map((entry) => ({
        headword: entry.headword.display,
        source_page: entry.source.source_page,
        source_page_end: entry.source.source_page_end,
      })),
    entries_with_blue_text: entries
      .filter((entry) => entry.format_flags.has_blue_unverified_text)
      .map((entry) => ({ headword: entry.headword.display, source_page: entry.source.source_page })),
    tables_requiring_review: [
      {
        table: "bible_books",
        records: records.bibleBooks.length,
        reason: "front_matter_table_requires_curatorial_spot_check",
      },
      {
        table: "appendix grammar tables",
        records: records.grammar.filter((record) => record.has_table_origin).length,
        reason: "appendix_tables_extracted_as_structured_cells_but_require_visual_review",
      },
    ],
    files: {
      raw_pages_jsonl: path.join(outDir, "raw_pages.jsonl"),
      spans_jsonl: path.join(outDir, "spans.jsonl"),
      entries_jsonl: path.join(outDir, "entries.jsonl"),
      references_jsonl: path.join(outDir, "references.jsonl"),
      abbreviations_jsonl: path.join(outDir, "abbreviations.jsonl"),
      bible_books_jsonl: path.join(outDir, "bible_books.jsonl"),
      grammar_jsonl: path.join(outDir, "grammar.jsonl"),
      phrases_jsonl: path.join(outDir, "phrases.jsonl"),
      manual_review_queue_csv: path.join(outDir, "manual_review_queue.csv"),
      dictionary_db: path.join(outDir, "dictionary.db"),
    },
    sqlite_validation: validation,
  };
}

export async function runPipeline({ pdfPath = DEFAULT_PDF, outDir = DEFAULT_OUT } = {}) {
  ensureDir(outDir);
  const { rawPages } = await extractPdf(pdfPath, outDir);
  const abbreviations = extractAbbreviations(rawPages);
  const references = extractReferences(rawPages);
  const bibleBooks = extractBibleBooks(rawPages);
  const grammar = extractGrammar(rawPages);
  const entries = parseEntries(rawPages, references);
  const phrases = entries.filter((entry) => entry.entry_type === "phrase");
  const reviewRows = makeReviewRows(entries, grammar);

  writeJsonl(path.join(outDir, "abbreviations.jsonl"), abbreviations);
  writeJsonl(path.join(outDir, "references.jsonl"), references);
  writeJsonl(path.join(outDir, "bible_books.jsonl"), bibleBooks);
  writeJsonl(path.join(outDir, "grammar.jsonl"), grammar);
  writeJsonl(path.join(outDir, "entries.jsonl"), entries);
  writeJsonl(path.join(outDir, "phrases.jsonl"), phrases);
  writeReviewCsv(path.join(outDir, "manual_review_queue.csv"), reviewRows);

  const dbPath = buildSqlite(outDir, { rawPages, entries, references, abbreviations, bibleBooks, grammar });
  const validation = validateSqlite(dbPath);
  const report = buildReport(outDir, { rawPages, entries, references, abbreviations, bibleBooks, grammar, reviewRows }, validation);
  writeJson(path.join(outDir, "extraction_report.json"), report);
  return report;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const pdfArg = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_PDF;
  const outArg = process.argv[3] ? path.resolve(process.argv[3]) : DEFAULT_OUT;
  runPipeline({ pdfPath: pdfArg, outDir: outArg })
    .then((report) => {
      console.log("PIPELINE_OK");
      console.log(JSON.stringify({
        pages: report.total_pages_processed,
        entries: report.total_entries_detected,
        phrases: report.total_phrases,
        review: report.total_manual_review_records,
        db: report.files.dictionary_db,
      }, null, 2));
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    });
}
