package org.miskito.dictionary.domain.model

data class EntryReference(
    val id: Long,
    val entryId: Long,
    val exampleId: Long?,
    val noteId: Long?,
    val referenceCode: String?,
    val rawReferenceText: String
)
