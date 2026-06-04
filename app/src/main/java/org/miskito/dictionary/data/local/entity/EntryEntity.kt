package org.miskito.dictionary.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "entries")
data class EntryEntity(
    @PrimaryKey(autoGenerate = true)
    @ColumnInfo(name = "id")
    val id: Long = 0,
    
    @ColumnInfo(name = "headword")
    val headword: String,
    
    @ColumnInfo(name = "normalized_headword")
    val normalizedHeadword: String,
    
    @ColumnInfo(name = "sort_key")
    val sortKey: String,
    
    @ColumnInfo(name = "entry_type")
    val entryType: String,
    
    @ColumnInfo(name = "parent_entry_id")
    val parentEntryId: Long?,
    
    @ColumnInfo(name = "part_of_speech")
    val partOfSpeech: String?,
    
    @ColumnInfo(name = "raw_part_of_speech")
    val rawPartOfSpeech: String?,
    
    @ColumnInfo(name = "source_page")
    val sourcePage: Int?,
    
    @ColumnInfo(name = "raw_text")
    val rawText: String,
    
    @ColumnInfo(name = "verification_status")
    val verificationStatus: String,
    
    @ColumnInfo(name = "extraction_confidence")
    val extractionConfidence: String,
    
    @ColumnInfo(name = "has_examples")
    val hasExamples: Boolean,
    
    @ColumnInfo(name = "has_notes")
    val hasNotes: Boolean,
    
    @ColumnInfo(name = "has_variants")
    val hasVariants: Boolean,
    
    @ColumnInfo(name = "created_at")
    val createdAt: String,
    
    @ColumnInfo(name = "updated_at")
    val updatedAt: String?
)
