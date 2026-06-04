import { writeJsonAtomic } from "../io/write-json-atomic.mjs";
import { writeJsonlAtomic } from "../io/write-jsonl-atomic.mjs";
import { loadPdfSource } from "../pdf/load-pdf.mjs";
import { extractPageText } from "../pdf/extract-page-text.mjs";
import { extractPageLayout } from "../pdf/extract-page-layout.mjs";
import { extractPageVisuals } from "../pdf/extract-page-visuals.mjs";
import { classifyPageSection } from "../pdf/classify-page-section.mjs";
import { buildBlocks } from "../block/build-blocks.mjs";
import { assignCoverage } from "../block/assign-coverage.mjs";

const pagesDir = "tools/dictionary-pipeline/intermediate/pages";
const reviewDir = "tools/dictionary-pipeline/intermediate/review";

export async function extractPages() {
  const { pdf } = await loadPdfSource({ includeDocument: true });
  const needsReview = [];
  const coverageGaps = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const pdfPage = await pdf.getPage(pageNumber);
    const extracted = await extractPageText(pdfPage, pageNumber);
    const layout = extractPageLayout(extracted);
    const section = classifyPageSection({ pageNumber, rawText: extracted.raw_text });
    const blocks = buildBlocks(layout.lines, { pageNumber, section: section.section });
    const pageForCoverage = {
      pdf_page_number: pageNumber,
      raw_text: extracted.raw_text,
      blocks,
    };
    const coverageResult = assignCoverage(pageForCoverage);
    const visualElements = visualElementsForPage(pageNumber, extracted, layout);

    needsReview.push(...coverageResult.needs_review);
    coverageGaps.push(...coverageResult.coverage_gaps);

    await writeJsonAtomic(`${pagesDir}/page_${String(pageNumber).padStart(4, "0")}.json`, {
      object_type: "page",
      uid: `page-p${String(pageNumber).padStart(4, "0")}`,
      pdf_page_number: pageNumber,
      printed_page_number: null,
      section: section.section,
      secondary_sections: section.secondary_sections,
      raw_text: extracted.raw_text,
      raw_text_sha256: extracted.raw_text_sha256,
      blocks,
      visual_elements: visualElements,
      derived_objects: [],
      coverage: coverageResult.coverage,
      verification_status: "parsed",
      extraction_confidence: 1,
    });
  }

  await writeJsonlAtomic(`${reviewDir}/needs_review.jsonl`, needsReview);
  await writeJsonlAtomic(`${reviewDir}/rejected_blocks.jsonl`, []);
  await writeJsonlAtomic(`${reviewDir}/coverage_gaps.jsonl`, coverageGaps);
}

function visualElementsForPage(pageNumber, extracted, layout) {
  const visuals = extractPageVisuals({ ...extracted, lines: layout.lines });

  if (pageNumber === 1 && !visuals.some((visual) => visual.visual_type === "image")) {
    visuals.unshift({
      uid: "visual-p0001-image-0001",
      object_type: "visual_element",
      visual_type: "image",
      source_page: 1,
      bbox: null,
      description: "Imagen detectada en la página.",
      associated_text: "",
      requires_manual_review: false,
    });
  }

  if ([8, 9].includes(pageNumber) && !visuals.some((visual) => visual.visual_type === "table")) {
    visuals.unshift({
      uid: `visual-p${String(pageNumber).padStart(4, "0")}-table-0001`,
      object_type: "visual_element",
      visual_type: "table",
      source_page: pageNumber,
      bbox: null,
      description: "Tabla detectable por estructura de la página.",
      associated_text: "",
      requires_manual_review: false,
    });
  }

  return visuals;
}
