package org.miskito.dictionary.data.local.dao

import androidx.room.Dao
import androidx.room.Query
import androidx.room.Transaction
import kotlinx.coroutines.flow.Flow
import org.miskito.dictionary.data.local.entity.HistoryEntity

@Dao
interface HistoryDao {
    @Query("SELECT * FROM history ORDER BY last_opened_at DESC")
    fun observeHistory(): Flow<List<HistoryEntity>>
    
    @Transaction
    suspend fun upsertHistory(entryId: Long, timestamp: String) {
        val count = getHistoryCount(entryId) ?: 0
        insertOrUpdateHistory(HistoryEntity(entryId, timestamp, count + 1))
    }
    
    @Query("SELECT open_count FROM history WHERE entry_id = :entryId")
    suspend fun getHistoryCount(entryId: Long): Int?
    
    @androidx.room.Insert(onConflict = androidx.room.OnConflictStrategy.REPLACE)
    suspend fun insertOrUpdateHistory(history: HistoryEntity)
    
    @Query("DELETE FROM history")
    suspend fun clearHistory()
}
