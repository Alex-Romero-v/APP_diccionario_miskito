import { allowedSections } from "../config/sections.mjs";

const headingRules = [
  [/PHRASES|EXPRESSIONS|GREETINGS|FRASES|EXPRESIONES|SALUDOS/i, "phrases"],
  [/GRAMMAR RULES|REGLAS GRAMATICALES/i, "grammar_rules"],
  [/VERB TABLES|TABLAS DE VERBOS/i, "verb_tables"],
  [/VERB TENSE|TIEMPO VERBAL/i, "verb_tense_guide"],
  [/REGULAR VERBS|VERBOS REGULARES/i, "regular_verbs"],
  [/IRREGULAR VERBS|VERBOS IRREGULARES/i, "irregular_verbs"],
  [/\bNOUNS\b|SUSTANTIVOS/i, "nouns"],
  [/VERB TO NOUN|VERBO A SUSTANTIVO/i, "verb_to_noun"],
  [/CONSTRUCT FORMS|FORMAS CONSTRUCT/i, "construct_forms"],
  [/COMPARISONS|COMPARACIONES/i, "comparisons"],
  [/NUMBERS|YEARS|N[ÚU]MEROS|AÑOS/i, "numbers_years"],
  [/PRONUNCIATION|PRONUNCIACI[ÓO]N/i, "pronunciation"],
  [/SHORT FORMS|FORMAS CORTAS/i, "short_forms"],
  [/APPENDIX|AP[ÉE]NDICE/i, "appendix_overview"],
];

export function classifyPageSection({ pageNumber, rawText = "" }) {
  const text = String(rawText);
  const headingSection = headingRules.find(([pattern]) => pattern.test(text))?.[1];
  const section = headingSection ?? sectionFromRange(pageNumber);

  return {
    section: allowedSections.has(section) ? section : "unknown",
    secondary_sections: [],
  };
}

function sectionFromRange(pageNumber) {
  if (pageNumber === 1) return "cover";
  if (pageNumber === 2) return "index";
  if (pageNumber === 3) return "usage";
  if (pageNumber === 4) return "dictionary_notes";
  if (pageNumber === 5) return "abbreviations";
  if (pageNumber >= 6 && pageNumber <= 7) return "references";
  if (pageNumber >= 8 && pageNumber <= 9) return "bible_books";
  if (pageNumber >= 10 && pageNumber <= 295) return "dictionary";
  if (pageNumber >= 296 && pageNumber <= 330) return "appendix_overview";
  return "unknown";
}
