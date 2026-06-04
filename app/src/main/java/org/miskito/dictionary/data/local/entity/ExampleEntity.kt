package org.miskito.dictionary.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey

@Entity(
    tableName = "examples",
    foreignKeys = [
        ForeignKey(
            entity = EntryEntity::class,
            parentColumns = ["id"],
            childColumns = ["entry_id"],
            onDelete = ForeignKey.CASCADE
        )
    ]
)
data class ExampleEntity(
    @PrimaryKey(autoGenerate = true)
    @ColumnInfo(name = "id")
    val id: Long = 0,
    
    @ColumnInfo(name = "entry_id", index = true)
    val entryId: Long,
    
    @ColumnInfo(name = "miskito_text")
    val miskitoText: String,
    
    @ColumnInfo(name = "spanish_text")
    val spanishText: String?,
    
    @ColumnInfo(name = "english_text")
    val englishText: String?,
    
    @ColumnInfo(name = "source_code")
    val sourceCode: String?,
    
    @ColumnInfo(name = "source_detail")
    val sourceDetail: String?,
    
    @ColumnInfo(name = "example_order")
    val exampleOrder: Int,
    
    @ColumnInfo(name = "is_literal_translation")
    val isLiteralTranslation: Boolean
)
