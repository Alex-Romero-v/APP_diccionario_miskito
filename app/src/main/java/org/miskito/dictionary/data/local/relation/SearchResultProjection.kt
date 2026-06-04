package org.miskito.dictionary.data.local.relation

import androidx.room.ColumnInfo

data class SearchResultProjection(
    @ColumnInfo(name = "id")
    val entryId: Long,
    
    @ColumnInfo(name = "headword")
    val headword: String,
    
    @ColumnInfo(name = "normalized_headword")
    val normalizedHeadword: String,
    
    @ColumnInfo(name = "sort_key")
    val sortKey: String,
    
    @ColumnInfo(name = "part_of_speech")
    val partOfSpeech: String?,
    
    @ColumnInfo(name = "spanish_translation")
    val spanishTranslation: String?,
    
    @ColumnInfo(name = "has_examples")
    val hasExamples: Boolean,
    
    @ColumnInfo(name = "has_notes")
    val hasNotes: Boolean,
    
    @ColumnInfo(name = "has_variants")
    val hasVariants: Boolean
)
