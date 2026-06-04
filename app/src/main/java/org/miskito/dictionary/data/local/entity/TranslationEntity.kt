package org.miskito.dictionary.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey

@Entity(
    tableName = "translations",
    foreignKeys = [
        ForeignKey(
            entity = EntryEntity::class,
            parentColumns = ["id"],
            childColumns = ["entry_id"],
            onDelete = ForeignKey.CASCADE
        )
    ]
)
data class TranslationEntity(
    @PrimaryKey(autoGenerate = true)
    @ColumnInfo(name = "id")
    val id: Long = 0,
    
    @ColumnInfo(name = "entry_id", index = true)
    val entryId: Long,
    
    @ColumnInfo(name = "spanish_text")
    val spanishText: String?,
    
    @ColumnInfo(name = "english_text")
    val englishText: String?,
    
    @ColumnInfo(name = "translation_order")
    val translationOrder: Int,
    
    @ColumnInfo(name = "is_literal")
    val isLiteral: Boolean,
    
    @ColumnInfo(name = "note")
    val note: String?
)
