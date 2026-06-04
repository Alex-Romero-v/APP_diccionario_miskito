package org.miskito.dictionary.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey

@Entity(
    tableName = "favorites",
    foreignKeys = [
        ForeignKey(
            entity = EntryEntity::class,
            parentColumns = ["id"],
            childColumns = ["entry_id"],
            onDelete = ForeignKey.CASCADE
        )
    ]
)
data class FavoriteEntity(
    @PrimaryKey
    @ColumnInfo(name = "entry_id")
    val entryId: Long,
    
    @ColumnInfo(name = "created_at")
    val createdAt: String
)
