package org.miskito.dictionary.domain.search

enum class SearchMatchType {
    EXACT_HEADWORD,
    EXACT_NORMALIZED_HEADWORD,
    EXACT_VARIANT,
    PREFIX_HEADWORD,
    PREFIX_VARIANT,
    SPANISH_TRANSLATION,
    ENGLISH_TRANSLATION,
    EXAMPLES,
    NOTES,
    NONE
}
