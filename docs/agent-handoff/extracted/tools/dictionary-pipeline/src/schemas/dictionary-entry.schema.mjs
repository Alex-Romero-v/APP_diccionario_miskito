import {
  result,
  requireArray,
  requireObject,
  requireString,
  validateBaseDerivedObject,
} from "./common.mjs";

const allowedEntryTypes = new Set([
  "main",
  "subentry",
  "compound",
  "phrase_entry",
  "derived_form",
  "verb_form",
  "construct_form",
  "bible_book",
  "cross_reference_only",
  "unknown",
]);

export function validateDictionaryEntry(entry) {
  const base = validateBaseDerivedObject(entry);
  const errors = base.ok ? [] : [...base.errors];

  requireString(errors, entry, "headword");
  requireString(errors, entry, "normalized_headword");
  requireString(errors, entry, "sort_key");
  if (!allowedEntryTypes.has(entry?.entry_type)) {
    errors.push("entry_type must be an allowed value.");
  }
  if (!("parent_uid" in (entry ?? {}))) {
    errors.push("parent_uid is required.");
  }
  if (!("raw_part_of_speech" in (entry ?? {}))) {
    errors.push("raw_part_of_speech is required.");
  }
  if (!("part_of_speech" in (entry ?? {}))) {
    errors.push("part_of_speech is required.");
  }
  for (const field of ["translations", "variants", "examples", "notes", "references", "cross_references"]) {
    requireArray(errors, entry, field);
  }
  requireObject(errors, entry, "flags");

  return result(errors);
}
