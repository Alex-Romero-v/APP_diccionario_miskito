package org.miskito.dictionary.data.local.dao

import androidx.room.Dao
import androidx.room.Query
import kotlinx.coroutines.flow.Flow
import org.miskito.dictionary.data.local.entity.PhraseEntity

@Dao
interface PhraseDao {
    @Query("SELECT * FROM phrases ORDER BY phrase_text ASC")
    fun observeAllPhrases(): Flow<List<PhraseEntity>>
    
    @Query("SELECT * FROM phrases WHERE category = :category ORDER BY phrase_text ASC")
    suspend fun getPhrasesByCategory(category: String): List<PhraseEntity>
}
