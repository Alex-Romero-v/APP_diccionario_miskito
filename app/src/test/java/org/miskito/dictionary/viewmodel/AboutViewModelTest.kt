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
            MetadataEntity("databaseVersion", "1.1"),
            MetadataEntity("entriesCount", "500")
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
    fun metadata_loadsAndExposesLegalNoticeAndStats() = runTest {
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
        assertEquals("500", state.metadata?.entriesCount)
        
        // ensure baseText and licenseNotice match exact legal text requirements
        assertEquals("Módulo de diccionario desarrollado para Google AI Studio.", state.baseText)
        assertEquals("All terms and rights belong to their respective original authors. No new license is invented or claimed by this software.", state.licenseNotice)

        collectJob.cancel()
    }
}

