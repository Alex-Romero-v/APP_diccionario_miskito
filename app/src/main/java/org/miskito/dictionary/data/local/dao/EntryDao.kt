package org.miskito.dictionary.data.local.dao

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Transaction
import kotlinx.coroutines.flow.Flow
import org.miskito.dictionary.data.local.entity.*
import org.miskito.dictionary.data.local.relation.EntryDetailRelation

@Dao
interface EntryDao {
    @Query("SELECT * FROM entries WHERE id = :id")
    suspend fun getEntryById(id: Long): EntryEntity?
    
    @Query("SELECT * FROM translations WHERE entry_id = :entryId ORDER BY translation_order ASC")
    suspend fun getTranslations(entryId: Long): List<TranslationEntity>
    
    @Query("SELECT * FROM variants WHERE entry_id = :entryId")
    suspend fun getVariants(entryId: Long): List<VariantEntity>
    
    @Query("SELECT * FROM examples WHERE entry_id = :entryId ORDER BY example_order ASC")
    suspend fun getExamples(entryId: Long): List<ExampleEntity>
    
    @Query("SELECT * FROM notes WHERE entry_id = :entryId ORDER BY note_order ASC")
    suspend fun getNotes(entryId: Long): List<NoteEntity>
    
    @Query("SELECT * FROM entry_references WHERE entry_id = :entryId")
    suspend fun getReferencesForEntry(entryId: Long): List<EntryReferenceEntity>
    
    @Transaction
    @Query("SELECT * FROM entries WHERE id = :id")
    suspend fun getEntryDetail(id: Long): EntryDetailRelation?
}
