package org.miskito.dictionary.data.local.relation

import androidx.room.Embedded
import androidx.room.Relation
import org.miskito.dictionary.data.local.entity.*

data class EntryDetailRelation(
    @Embedded val entry: EntryEntity,
    
    @Relation(
        parentColumn = "id",
        entityColumn = "entry_id"
    )
    val translations: List<TranslationEntity>,
    
    @Relation(
        parentColumn = "id",
        entityColumn = "entry_id"
    )
    val variants: List<VariantEntity>,
    
    @Relation(
        parentColumn = "id",
        entityColumn = "entry_id"
    )
    val examples: List<ExampleEntity>,
    
    @Relation(
        parentColumn = "id",
        entityColumn = "entry_id"
    )
    val notes: List<NoteEntity>,
    
    @Relation(
        parentColumn = "id",
        entityColumn = "entry_id"
    )
    val references: List<EntryReferenceEntity>
)
