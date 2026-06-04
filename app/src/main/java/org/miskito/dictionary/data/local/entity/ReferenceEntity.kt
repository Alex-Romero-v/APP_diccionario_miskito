package org.miskito.dictionary.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "references")
data class ReferenceEntity(
    @PrimaryKey
    @ColumnInfo(name = "code")
    val code: String,
    
    @ColumnInfo(name = "short_name")
    val shortName: String?,
    
    @ColumnInfo(name = "full_description")
    val fullDescription: String?,
    
    @ColumnInfo(name = "language")
    val language: String?,
    
    @ColumnInfo(name = "reference_type")
    val referenceType: String?
)
