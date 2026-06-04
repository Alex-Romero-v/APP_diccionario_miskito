package org.miskito.dictionary.domain.model

data class DictionaryEntry(
    val id: Long,
    val headword: String,
    val normalizedHeadword: String,
    val sortKey: String,
    val entryType: EntryType,
    val parentEntryId: Long?,
    val partOfSpeech: String?,
    val rawPartOfSpeech: String?,
    val sourcePage: Int?,
    val rawText: String,
    val verificationStatus: VerificationStatus,
    val extractionConfidence: ExtractionConfidence,
    val hasExamples: Boolean,
    val hasNotes: Boolean,
    val hasVariants: Boolean,
    val createdAt: String,
    val updatedAt: String?
)
