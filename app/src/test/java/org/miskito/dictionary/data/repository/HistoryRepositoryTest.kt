package org.miskito.dictionary.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Test
import org.miskito.dictionary.data.local.dao.HistoryDao
import org.miskito.dictionary.data.local.entity.HistoryEntity

class HistoryRepositoryTest {

    private val mockHistoryDao = object : HistoryDao {
        val historyMap = mutableMapOf<Long, HistoryEntity>()

        override fun observeHistory(): Flow<List<HistoryEntity>> {
            return flowOf(historyMap.values.toList())
        }

        override suspend fun upsertHistory(entryId: Long, timestamp: String) {
            val count = getHistoryCount(entryId) ?: 0
            insertOrUpdateHistory(HistoryEntity(entryId, timestamp, count + 1))
        }

        override suspend fun getHistoryCount(entryId: Long): Int? {
            return historyMap[entryId]?.openCount
        }

        override suspend fun insertOrUpdateHistory(history: HistoryEntity) {
            historyMap[history.entryId] = history
        }

        override suspend fun clearHistory() {
            historyMap.clear()
        }
    }

    private val repository = HistoryRepository(mockHistoryDao)

    @Test
    fun recordAndClearHistory_worksCorrectly() = runBlocking {
        repository.recordOpenedEntry(1L)
        repository.recordOpenedEntry(1L)
        
        assertEquals(2, mockHistoryDao.historyMap[1L]?.openCount)
        
        repository.clearHistory()
        assertEquals(0, mockHistoryDao.historyMap.size)
    }
}
