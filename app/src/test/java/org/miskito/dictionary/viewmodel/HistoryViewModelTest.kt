package org.miskito.dictionary.viewmodel

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.miskito.dictionary.data.local.dao.HistoryDao
import org.miskito.dictionary.data.local.entity.HistoryEntity
import org.miskito.dictionary.data.local.entity.EntryEntity
import org.miskito.dictionary.data.repository.HistoryRepository
import org.miskito.dictionary.domain.model.HistoryEntry

@OptIn(ExperimentalCoroutinesApi::class)
class HistoryViewModelTest {

    private val testDispatcher = StandardTestDispatcher()

    private val historyFlow = MutableStateFlow<List<HistoryEntity>>(emptyList())
    private var cleared = false

    private val mockHistoryDao = object : HistoryDao {
        override fun observeHistory() = historyFlow
        override suspend fun getHistoryCount(entryId: Long): Int? = 0
        override suspend fun insertOrUpdateHistory(history: HistoryEntity) {}
        override suspend fun clearHistory() { cleared = true }
    }

    private lateinit var repository: HistoryRepository
    private lateinit var viewModel: HistoryViewModel

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        cleared = false
        repository = HistoryRepository(mockHistoryDao)
        viewModel = HistoryViewModel(repository)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun initialState_isLoadingOrEmpty() = runTest {
        val collectJob = launch(UnconfinedTestDispatcher(testScheduler)) {
            viewModel.uiState.collect {}
        }
        val state = viewModel.uiState.value
        assertTrue(state is HistoryUiState.Empty || state is HistoryUiState.Loading)
        collectJob.cancel()
    }

    @Test
    fun updateHistory_emitsSuccess() = runTest {
        val collectJob = launch(UnconfinedTestDispatcher(testScheduler)) {
            viewModel.uiState.collect {}
        }
        
        historyFlow.value = listOf(HistoryEntity(1, "now", 1))
        advanceUntilIdle()

        val state = viewModel.uiState.value
        assertTrue(state is HistoryUiState.Success)
        assertEquals(1, (state as HistoryUiState.Success).history.size)
        collectJob.cancel()
    }

    @Test
    fun clearHistory_callsRepository() = runTest {
        viewModel.clearHistory()
        advanceUntilIdle()
        assertTrue(cleared)
    }
}
