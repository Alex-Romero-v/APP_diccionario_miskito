package org.miskito.dictionary.domain.model

data class Example(
    val id: Long,
    val entryId: Long,
    val miskitoText: String,
    val spanishText: String?,
    val englishText: String?,
    val sourceCode: String?,
    val sourceDetail: String?,
    val exampleOrder: Int,
    val isLiteralTranslation: Boolean
)
