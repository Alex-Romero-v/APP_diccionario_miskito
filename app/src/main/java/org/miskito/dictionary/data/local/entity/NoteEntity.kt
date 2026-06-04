package org.miskito.dictionary.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey

@Entity(
    tableName = "notes",
    foreignKeys = [
        ForeignKey(
            entity = EntryEntity::class,
            parentColumns = ["id"],
            childColumns = ["entry_id"],
            onDelete = ForeignKey.CASCADE
        )
    ]
)
data class NoteEntity(
    @PrimaryKey(autoGenerate = true)
    @ColumnInfo(name = "id")
    val id: Long = 0,
    
    @ColumnInfo(name = "entry_id", index = true)
    val entryId: Long,
    
    @ColumnInfo(name = "note_type")
    val noteType: String,
    
    @ColumnInfo(name = "note_text")
    val noteText: String,
    
    @ColumnInfo(name = "note_order")
    val noteOrder: Int
)
