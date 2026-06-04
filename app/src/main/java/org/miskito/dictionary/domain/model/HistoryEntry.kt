package org.miskito.dictionary.domain.model

data class HistoryEntry(
    val entryId: Long,
    val lastOpenedAt: String,
    val openCount: Int
)
