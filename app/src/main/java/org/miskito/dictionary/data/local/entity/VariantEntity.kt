package org.miskito.dictionary.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.PrimaryKey

@Entity(
    tableName = "variants",
    foreignKeys = [
        ForeignKey(
            entity = EntryEntity::class,
            parentColumns = ["id"],
            childColumns = ["entry_id"],
            onDelete = ForeignKey.CASCADE
        )
    ]
)
data class VariantEntity(
    @PrimaryKey(autoGenerate = true)
    @ColumnInfo(name = "id")
    val id: Long = 0,
    
    @ColumnInfo(name = "entry_id", index = true)
    val entryId: Long,
    
    @ColumnInfo(name = "variant_text")
    val variantText: String,
    
    @ColumnInfo(name = "normalized_variant")
    val normalizedVariant: String,
    
    @ColumnInfo(name = "variant_type")
    val variantType: String,
    
    @ColumnInfo(name = "note")
    val note: String?
)
