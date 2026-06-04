package org.miskito.dictionary.domain.model

data class Translation(
    val id: Long,
    val entryId: Long,
    val spanishText: String?,
    val englishText: String?,
    val translationOrder: Int,
    val isLiteral: Boolean,
    val note: String?
)
