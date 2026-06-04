package org.miskito.dictionary.domain.model

data class Phrase(
    val id: Long,
    val phraseText: String,
    val normalizedPhrase: String,
    val spanishText: String?,
    val englishText: String?,
    val category: PhraseCategory,
    val sourcePage: Int?,
    val rawText: String
)
