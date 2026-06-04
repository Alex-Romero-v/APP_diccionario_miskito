package org.miskito.dictionary.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey

@Entity(
    tableName = "entry_references",
    foreignKeys = [
        ForeignKey(
            entity = EntryEntity::class,
            parentColumns = ["id"],
            childColumns = ["entry_id"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = ExampleEntity::class,
            parentColumns = ["id"],
            childColumns = ["example_id"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = NoteEntity::class,
            parentColumns = ["id"],
            childColumns = ["note_id"],
            onDelete = ForeignKey.CASCADE
        ),
        ForeignKey(
            entity = ReferenceEntity::class,
            parentColumns = ["code"],
            childColumns = ["reference_code"],
            onDelete = ForeignKey.CASCADE
        )
    ]
)
data class EntryReferenceEntity(
    @PrimaryKey(autoGenerate = true)
    @ColumnInfo(name = "id")
    val id: Long = 0,
    
    @ColumnInfo(name = "entry_id")
    val entryId: Long,
    
    @ColumnInfo(name = "example_id")
    val exampleId: Long?,
    
    @ColumnInfo(name = "note_id")
    val noteId: Long?,
    
    @ColumnInfo(name = "reference_code")
    val referenceCode: String?,
    
    @ColumnInfo(name = "raw_reference_text")
    val rawReferenceText: String
)
