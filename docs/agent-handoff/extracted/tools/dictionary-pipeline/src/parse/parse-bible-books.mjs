import { readJson } from "../io/read-json.mjs";
import { writeJsonlAtomic } from "../io/write-jsonl-atomic.mjs";
import { createUidAllocator } from "../normalize/slugify-uid.mjs";
import { validateCatalogObject } from "../schemas/catalog.schema.mjs";

const bibleBooksPath = "tools/dictionary-pipeline/intermediate/catalog/bible_books.jsonl";
const englishBooks = [
  "Song of Solomon",
  "1 Thessalonians",
  "2 Thessalonians",
  "1 Corinthians",
  "2 Corinthians",
  "1 Chronicles",
  "2 Chronicles",
  "Deuteronomy",
  "Lamentations",
  "Ecclesiastes",
  "Philippians",
  "Revelation",
  "1 Samuel",
  "2 Samuel",
  "1 Kings",
  "2 Kings",
  "Nehemiah",
  "Proverbs",
  "Zephaniah",
  "Zechariah",
  "Matthew",
  "Romans",
  "Galatians",
  "Ephesians",
  "Colossians",
  "1 Timothy",
  "2 Timothy",
  "Philemon",
  "Hebrews",
  "1 Peter",
  "2 Peter",
  "1 John",
  "2 John",
  "3 John",
  "Genesis",
  "Exodus",
  "Leviticus",
  "Numbers",
  "Joshua",
  "Judges",
  "Ruth",
  "Ezra",
  "Esther",
  "Job",
  "Psalms",
  "Isaiah",
  "Jeremiah",
  "Ezekiel",
  "Daniel",
  "Hosea",
  "Joel",
  "Amos",
  "Obadiah",
  "Jonah",
  "Micah",
  "Nahum",
  "Habakkuk",
  "Haggai",
  "Malachi",
  "Mark",
  "Luke",
  "John",
  "Acts",
  "Titus",
  "James",
  "Jude",
];

export async function parseBibleBooks() {
  const pages = await Promise.all([
    readJson("tools/dictionary-pipeline/intermediate/pages/page_0008.json"),
    readJson("tools/dictionary-pipeline/intermediate/pages/page_0009.json"),
  ]);
  const allocate = createUidAllocator();
  const rows = [];

  for (const page of pages) {
    const section = page.pdf_page_number === 8 ? "hebrew_scriptures" : "greek_scriptures";
    for (let index = 0; index < page.blocks.length; index += 1) {
      const block = page.blocks[index];
      const parsed = parseBibleBookRow(block.text);
      if (!parsed) continue;

      const sourceBlocks = [block.block_id];
      let rawText = block.text;
      if (index + 1 < page.blocks.length && !parseBibleBookRow(page.blocks[index + 1].text) && !isHeader(page.blocks[index + 1].text)) {
        rawText = `${rawText} ${page.blocks[index + 1].text}`;
        parsed.spanish = `${parsed.spanish} ${page.blocks[index + 1].text}`.replace(/\s+/g, " ").trim();
        sourceBlocks.push(page.blocks[index + 1].block_id);
        index += 1;
      }

      const row = {
        object_type: "bible_book",
        uid: allocate.bibleBook(page.pdf_page_number, parsed.miskito),
        section,
        miskito: parsed.miskito,
        short_code: parsed.short_code,
        english: parsed.english,
        spanish: parsed.spanish,
        source_page: page.pdf_page_number,
        source_blocks: sourceBlocks,
        raw_text: rawText,
        extraction_confidence: 0.95,
        verification_status: "parsed",
      };
      const validation = validateCatalogObject(row);
      if (!validation.ok) throw new Error(validation.errors.join("\n"));
      rows.push(row);
    }
  }

  await writeJsonlAtomic(bibleBooksPath, rows);
  return rows;
}

function parseBibleBookRow(text) {
  const value = String(text).trim();
  if (isHeader(value)) return null;
  const tokens = value.split(/\s+/);
  let codeIndex = -1;
  let english = null;
  let rest = "";
  for (let index = 1; index < tokens.length - 1; index += 1) {
    if (!/^[A-Za-z0-9.]+$/.test(tokens[index])) continue;
    const candidateRest = tokens.slice(index + 1).join(" ");
    const candidateEnglish = englishBooks.find((book) => candidateRest.startsWith(`${book} `) || candidateRest === book);
    if (candidateEnglish) {
      codeIndex = index;
      english = candidateEnglish;
      rest = candidateRest;
      break;
    }
  }
  if (codeIndex <= 0 || !english) return null;
  return {
    miskito: tokens.slice(0, codeIndex).join(" "),
    short_code: tokens[codeIndex],
    english,
    spanish: rest.slice(english.length).trim(),
  };
}

function isHeader(text) {
  return /BOOKS OF THE BIBLE|HIBRU ULBANKA|GRIK ULBANKA|Miskito Tnatka|^\d+$/.test(String(text));
}
