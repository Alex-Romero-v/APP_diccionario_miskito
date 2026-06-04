package org.miskito.dictionary.domain.model

data class DictionaryNote(
    val id: Long,
    val entryId: Long,
    val noteType: NoteType,
    val noteText: String,
    val noteOrder: Int
)
