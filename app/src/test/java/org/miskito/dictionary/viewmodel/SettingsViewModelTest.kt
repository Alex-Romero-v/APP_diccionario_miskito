package org.miskito.dictionary.viewmodel

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.miskito.dictionary.data.local.dao.HistoryDao
import org.miskito.dictionary.data.local.entity.HistoryEntity
import org.miskito.dictionary.data.preferences.UserPreferences
import org.miskito.dictionary.data.preferences.UserPreferencesDataSource
import org.miskito.dictionary.data.repository.HistoryRepository
import org.miskito.dictionary.data.repository.SettingsRepository
import org.miskito.dictionary.domain.model.EnglishVisibility
import org.miskito.dictionary.domain.model.FontSizePreference
import org.miskito.dictionary.domain.model.ThemePreference

@OptIn(ExperimentalCoroutinesApi::class)
class SettingsViewModelTest {

    private val testDispatcher = StandardTestDispatcher()

    private val prefsFlow = MutableStateFlow(UserPreferences())
    
    private var cleared = false

    private val mockHistoryDao = object : HistoryDao {
        override fun observeHistory() = flowOf(emptyList<HistoryEntity>())
        override suspend fun getHistoryCount(entryId: Long): Int? = 0
        override suspend fun insertOrUpdateHistory(history: HistoryEntity) {}
        override suspend fun clearHistory() { cleared = true }
    }

    private lateinit var settingsRepository: SettingsRepository
    private lateinit var historyRepository: HistoryRepository
    private lateinit var viewModel: SettingsViewModel
    private val tempFile = java.io.File.createTempFile("test_prefs", ".preferences_pb")

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        cleared = false
        val testDataStore = androidx.datastore.preferences.core.PreferenceDataStoreFactory.create(
            scope = TestScope(testDispatcher),
            produceFile = { tempFile }
        )
        val dataSource = UserPreferencesDataSource(testDataStore)
        settingsRepository = SettingsRepository(dataSource)
        historyRepository = HistoryRepository(mockHistoryDao)
        viewModel = SettingsViewModel(settingsRepository, historyRepository)
    }

    @After
    fun tearDown() {
        tempFile.delete()
        Dispatchers.resetMain()
    }

    @Test
    fun changeFontSize_updatesState() = runTest {
        val collectJob = launch(UnconfinedTestDispatcher(testScheduler)) {
            viewModel.uiState.collect {}
        }
        viewModel.changeFontSize(FontSizePreference.LARGE)
        advanceUntilIdle()
        assertEquals(FontSizePreference.LARGE, viewModel.uiState.value.fontSize)
        collectJob.cancel()
    }

    @Test
    fun changeTheme_updatesState() = runTest {
        val collectJob = launch(UnconfinedTestDispatcher(testScheduler)) {
            viewModel.uiState.collect {}
        }
        viewModel.toggleTheme(ThemePreference.DARK)
        advanceUntilIdle()
        assertEquals(ThemePreference.DARK, viewModel.uiState.value.theme)
        collectJob.cancel()
    }

    @Test
    fun clearHistory_callsRepository() = runTest {
        viewModel.clearHistory()
        advanceUntilIdle()
        assertTrue(cleared)
    }
}
