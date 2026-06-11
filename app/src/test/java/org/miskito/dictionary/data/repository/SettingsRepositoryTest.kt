package org.miskito.dictionary.data.repository

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.PreferenceDataStoreFactory
import androidx.datastore.preferences.core.Preferences
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.cancel
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.TestScope
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.rules.TemporaryFolder
import org.miskito.dictionary.data.preferences.UserPreferencesDataSource
import org.miskito.dictionary.domain.model.EnglishVisibility
import org.miskito.dictionary.domain.model.FontSizePreference
import org.miskito.dictionary.domain.model.ThemePreference

@OptIn(ExperimentalCoroutinesApi::class)
class SettingsRepositoryTest {

    @get:Rule
    val tmpFolder: TemporaryFolder = TemporaryFolder.builder().assureDeletion().build()

    private val testDispatcher = StandardTestDispatcher()
    private lateinit var dataStoreScope: TestScope
    private lateinit var testDataStore: DataStore<Preferences>
    private lateinit var repository: SettingsRepository

    @Before
    fun setup() {
        dataStoreScope = TestScope(testDispatcher)
        testDataStore = PreferenceDataStoreFactory.create(
            scope = dataStoreScope,
            produceFile = { tmpFolder.newFile("user_prefs_${System.nanoTime()}.preferences_pb") }
        )
        val dataSource = UserPreferencesDataSource(testDataStore)
        repository = SettingsRepository(dataSource)
    }

    @After
    fun tearDown() {
        dataStoreScope.cancel()
    }

    @Test
    fun defaultPreferences_areCorrect() = runBlocking {
        val initialPrefs = repository.userPreferencesFlow.first()
        
        assertEquals(FontSizePreference.NORMAL, initialPrefs.fontSize)
        assertEquals(ThemePreference.SYSTEM, initialPrefs.theme)
        assertEquals(EnglishVisibility.DETAIL_ONLY, initialPrefs.englishVisibility)
    }

    @Test
    fun updatePreferences_persistsCorrectly() = runBlocking {
        repository.updateFontSize(FontSizePreference.LARGE)
        repository.updateTheme(ThemePreference.DARK)
        repository.updateEnglishVisibility(EnglishVisibility.ALWAYS)
        
        val updatedPrefs = repository.userPreferencesFlow.first()
        
        assertEquals(FontSizePreference.LARGE, updatedPrefs.fontSize)
        assertEquals(ThemePreference.DARK, updatedPrefs.theme)
        assertEquals(EnglishVisibility.ALWAYS, updatedPrefs.englishVisibility)
    }
}
