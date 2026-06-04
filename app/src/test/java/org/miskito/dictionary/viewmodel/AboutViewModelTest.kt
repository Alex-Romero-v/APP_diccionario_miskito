package org.miskito.dictionary.viewmodel

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.miskito.dictionary.data.local.dao.MetadataDao
import org.miskito.dictionary.data.local.entity.MetadataEntity
import org.miskito.dictionary.data.repository.MetadataRepository

@OptIn(ExperimentalCoroutinesApi::class)
class AboutViewModelTest {

    private val testDispatcher = StandardTestDispatcher()

    private val mockMetadataDao = object : MetadataDao {
        override suspend fun getValue(key: String): String? = null
        override fun observeAllMetadata() = flowOf(listOf(
            MetadataEntity("dictionaryName", "Fake Name"),
            MetadataEntity("databaseVersion", "1.1")
        ))
    }

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun metadata_loadsAndExposesBaseText() = runTest {
        val repo = MetadataRepository(mockMetadataDao)
        val viewModel = AboutViewModel(repo)

        val collectJob = launch(UnconfinedTestDispatcher(testScheduler)) {
            viewModel.uiState.collect {}
        }
        advanceUntilIdle()

        val state = viewModel.uiState.value
        assertNotNull(state.metadata)
        assertEquals("Fake Name", state.metadata?.dictionaryName)
        assertEquals("1.1", state.metadata?.databaseVersion)
        
        // ensure baseText and licenseNotice are not empty
        assertTrue(state.baseText.isNotEmpty())
        assertTrue(state.licenseNotice.isNotEmpty())

        collectJob.cancel()
    }
}
