import { readJson } from "../io/read-json.mjs";
import { writeJsonlAtomic } from "../io/write-jsonl-atomic.mjs";
import { classifyPageSection } from "../pdf/classify-page-section.mjs";

const sectionsPath = "tools/dictionary-pipeline/intermediate/appendix/sections.jsonl";

export async function parseAppendix() {
  const sections = [];

  for (let pageNumber = 296; pageNumber <= 330; pageNumber += 1) {
    const page = await readJson(`tools/dictionary-pipeline/intermediate/pages/page_${String(pageNumber).padStart(4, "0")}.json`);
    const headingBlocks = page.blocks.filter((block) => isAppendixHeading(block, pageNumber));
    const heading = headingBlocks[0]?.text ?? page.blocks.find((block) => block.block_type !== "page_number")?.text ?? "";
    const classification = classifyPageSection({ pageNumber, rawText: heading });
    const secondarySections = detectSecondarySections(page.raw_text, classification.section);

    sections.push({
      object_type: "appendix_section",
      uid: `appendix-section-p${String(pageNumber).padStart(4, "0")}`,
      section: classifyFinalPage(pageNumber, classification.section),
      secondary_sections: secondarySections,
      heading,
      source_page: pageNumber,
      source_blocks: (headingBlocks.length > 0 ? headingBlocks : page.blocks.slice(0, 1)).map((block) => block.block_id),
      raw_text: page.raw_text,
      extraction_confidence: 0.9,
      verification_status: "parsed",
    });
  }

  await writeJsonlAtomic(sectionsPath, sections);
  return sections;
}

function isAppendixHeading(block, pageNumber) {
  if (block.block_type === "page_number") return false;
  if (pageNumber === 296) return /APPENDIX|VERB|NOUN|PHRASES|GRAMMAR|PRONUNCIATION/i.test(block.text);
  return block.reading_order <= 5 && /[A-ZÃÁÉÍÓÚÑ]{3,}|PHRASES|VERB|NOUN|KAIA|BALAIA|WAIA|PRONUNCIATION/i.test(block.text);
}

function detectSecondarySections(rawText, primary) {
  const candidates = [
    ["verb_overview", /VERB SECTION OVERVIEW/i],
    ["verb_tables", /VERB TABL/i],
    ["verb_tense_guide", /VERB TENSE GUIDE/i],
    ["regular_verbs", /REGULAR VERBS/i],
    ["nouns", /NOUNS/i],
    ["phrases", /PHRASES|GREETINGS/i],
  ];
  return candidates.filter(([section, pattern]) => section !== primary && pattern.test(rawText)).map(([section]) => section);
}

function classifyFinalPage(pageNumber, section) {
  if (pageNumber >= 329) return "phrases";
  return section;
}
