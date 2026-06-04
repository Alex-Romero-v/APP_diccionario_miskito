package org.miskito.dictionary.data.local.fts

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.Fts4

@Fts4
@Entity(tableName = "search_index")
data class SearchIndexFtsEntity(
    @ColumnInfo(name = "entry_id")
    val entryId: Long,
    
    @ColumnInfo(name = "headword")
    val headword: String,
    
    @ColumnInfo(name = "normalized_headword")
    val normalizedHeadword: String,
    
    @ColumnInfo(name = "variants_text")
    val variantsText: String?,
    
    @ColumnInfo(name = "spanish_text")
    val spanishText: String?,
    
    @ColumnInfo(name = "english_text")
    val englishText: String?,
    
    @ColumnInfo(name = "examples_text")
    val examplesText: String?,
    
    @ColumnInfo(name = "notes_text")
    val notesText: String?
)

