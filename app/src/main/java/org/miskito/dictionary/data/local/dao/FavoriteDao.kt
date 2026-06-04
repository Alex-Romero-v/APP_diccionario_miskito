package org.miskito.dictionary.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow
import org.miskito.dictionary.data.local.entity.FavoriteEntity

@Dao
interface FavoriteDao {
    @Query("SELECT * FROM favorites ORDER BY created_at DESC")
    fun observeFavorites(): Flow<List<FavoriteEntity>>
    
    @Query("SELECT EXISTS(SELECT 1 FROM favorites WHERE entry_id = :entryId)")
    fun observeIsFavorite(entryId: Long): Flow<Boolean>
    
    @Query("SELECT EXISTS(SELECT 1 FROM favorites WHERE entry_id = :entryId)")
    suspend fun isFavorite(entryId: Long): Boolean
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun addFavorite(favorite: FavoriteEntity)
    
    @Query("DELETE FROM favorites WHERE entry_id = :entryId")
    suspend fun removeFavorite(entryId: Long)
}
