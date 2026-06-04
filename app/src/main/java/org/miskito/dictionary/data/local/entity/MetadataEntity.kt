package org.miskito.dictionary.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "metadata")
data class MetadataEntity(
    @PrimaryKey
    @ColumnInfo(name = "key")
    val key: String,
    
    @ColumnInfo(name = "value")
    val value: String
)
