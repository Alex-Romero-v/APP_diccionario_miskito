package org.miskito.dictionary.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "phrases")
data class PhraseEntity(
    @PrimaryKey(autoGenerate = true)
    @ColumnInfo(name = "id")
    val id: Long = 0,
    
    @ColumnInfo(name = "phrase_text")
    val phraseText: String,
    
    @ColumnInfo(name = "normalized_phrase")
    val normalizedPhrase: String,
    
    @ColumnInfo(name = "spanish_text")
    val spanishText: String?,
    
    @ColumnInfo(name = "english_text")
    val englishText: String?,
    
    @ColumnInfo(name = "category")
    val category: String,
    
    @ColumnInfo(name = "source_page")
    val sourcePage: Int?,
    
    @ColumnInfo(name = "raw_text")
    val rawText: String
)
