package org.miskito.dictionary.domain.model

data class SearchResult(
    val entryId: Long,
    val headword: String,
    val normalizedHeadword: String,
    val partOfSpeech: String?,
    val spanishTranslation: String?,
    val variantLabel: String?,
    val hasExamples: Boolean,
    val hasNotes: Boolean
)
