package org.miskito.dictionary.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import org.miskito.dictionary.data.local.dao.HistoryDao
import org.miskito.dictionary.domain.model.HistoryEntry
import java.time.Instant

class HistoryRepository(
    private val historyDao: HistoryDao
) {
    fun observeHistory(): Flow<List<HistoryEntry>> {
        return historyDao.observeHistory().map { list -> list.map { it.toDomainModel() } }
    }

    suspend fun recordOpenedEntry(entryId: Long) {
        historyDao.upsertHistory(entryId, Instant.now().toString())
    }

    suspend fun clearHistory() {
        historyDao.clearHistory()
    }
}
