package org.miskito.dictionary.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Test
import org.miskito.dictionary.data.local.dao.FavoriteDao
import org.miskito.dictionary.data.local.entity.FavoriteEntity

class FavoritesRepositoryTest {

    private val mockFavoriteDao = object : FavoriteDao {
        val favorites = mutableSetOf<Long>()
        
        override fun observeFavorites(): Flow<List<FavoriteEntity>> {
            return flowOf(favorites.map { FavoriteEntity(it, "now") })
        }

        override fun observeIsFavorite(entryId: Long): Flow<Boolean> {
            return flowOf(favorites.contains(entryId))
        }

        override suspend fun isFavorite(entryId: Long): Boolean {
            return favorites.contains(entryId)
        }

        override suspend fun addFavorite(favorite: FavoriteEntity) {
            favorites.add(favorite.entryId)
        }

        override suspend fun removeFavorite(entryId: Long) {
            favorites.remove(entryId)
        }
    }
    
    private val repository = FavoritesRepository(mockFavoriteDao)

    @Test
    fun addAndRemoveFavorite_worksCorrectly() = runBlocking {
        repository.addFavorite(1L)
        repository.addFavorite(1L) // should not duplicate
        
        assertEquals(1, mockFavoriteDao.favorites.size)
        
        repository.removeFavorite(1L)
        assertEquals(0, mockFavoriteDao.favorites.size)
    }
}
