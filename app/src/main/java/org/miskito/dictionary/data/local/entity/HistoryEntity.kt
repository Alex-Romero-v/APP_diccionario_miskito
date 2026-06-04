package org.miskito.dictionary.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey

@Entity(
    tableName = "history",
    foreignKeys = [
        ForeignKey(
            entity = EntryEntity::class,
            parentColumns = ["id"],
            childColumns = ["entry_id"],
            onDelete = ForeignKey.CASCADE
        )
    ]
)
data class HistoryEntity(
    @PrimaryKey
    @ColumnInfo(name = "entry_id")
    val entryId: Long,
    
    @ColumnInfo(name = "last_opened_at")
    val lastOpenedAt: String,
    
    @ColumnInfo(name = "open_count")
    val openCount: Int
)
