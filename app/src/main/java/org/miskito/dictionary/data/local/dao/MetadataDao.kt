package org.miskito.dictionary.data.local.dao

import androidx.room.Dao
import androidx.room.Query
import kotlinx.coroutines.flow.Flow
import org.miskito.dictionary.data.local.entity.MetadataEntity

@Dao
interface MetadataDao {
    @Query("SELECT value FROM metadata WHERE key = :key LIMIT 1")
    suspend fun getValue(key: String): String?
    
    @Query("SELECT * FROM metadata")
    fun observeAllMetadata(): Flow<List<MetadataEntity>>
}
