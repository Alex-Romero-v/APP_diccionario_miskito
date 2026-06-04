package org.miskito.dictionary.domain.model

data class DictionaryReference(
    val code: String,
    val shortName: String?,
    val fullDescription: String?,
    val language: String?,
    val referenceType: String?
)
