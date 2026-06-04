package org.miskito.dictionary.domain.model

data class DictionaryMetadata(
    val dictionaryName: String,
    val dictionarySource: String,
    val dictionaryDate: String,
    val databaseVersion: String,
    val buildDate: String,
    val entriesCount: String,
    val examplesCount: String,
    val appMinSupportedVersion: String
)
