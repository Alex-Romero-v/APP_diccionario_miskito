package org.miskito.dictionary.domain.model

data class DictionaryEntryDetail(
    val entry: DictionaryEntry,
    val translations: List<Translation>,
    val variants: List<Variant>,
    val examples: List<Example>,
    val notes: List<DictionaryNote>,
    val references: List<EntryReference>
)
