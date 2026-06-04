package org.miskito.dictionary.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import org.miskito.dictionary.data.local.dao.FavoriteDao
import org.miskito.dictionary.data.local.entity.FavoriteEntity
import org.miskito.dictionary.domain.model.FavoriteEntry
import java.time.Instant

class FavoritesRepository(
    private val favoriteDao: FavoriteDao
) {
    fun observeFavorites(): Flow<List<FavoriteEntry>> {
        return favoriteDao.observeFavorites().map { list -> list.map { it.toDomainModel() } }
    }

    fun isFavorite(entryId: Long): Flow<Boolean> {
        return favoriteDao.observeIsFavorite(entryId)
    }

    suspend fun addFavorite(entryId: Long) {
        if (!favoriteDao.isFavorite(entryId)) {
            favoriteDao.addFavorite(
                FavoriteEntity(
                    entryId = entryId,
                    createdAt = Instant.now().toString()
                )
            )
        }
    }

    suspend fun removeFavorite(entryId: Long) {
        favoriteDao.removeFavorite(entryId)
    }
}
