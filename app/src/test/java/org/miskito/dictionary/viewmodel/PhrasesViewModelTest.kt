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
import org.miskito.dictionary.data.local.dao.PhraseDao
import org.miskito.dictionary.data.local.entity.PhraseEntity
import org.miskito.dictionary.data.repository.PhrasesRepository
import org.miskito.dictionary.domain.model.PhraseCategory

@OptIn(ExperimentalCoroutinesApi::class)
class PhrasesViewModelTest {

    private val testDispatcher = StandardTestDispatcher()
    
    private val phrasesFlow = MutableStateFlow<List<PhraseEntity>>(emptyList())
    private var hasPhrases = true

    private val mockPhraseDao = object : PhraseDao {
        override fun observeAllPhrases() = phrasesFlow
        override suspend fun getPhrasesByCategory(category: String): List<PhraseEntity> = emptyList()
    }

    private lateinit var repository: PhrasesRepository

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun unavailable_emitsUnavailableState() = runTest {
        val repo = object : PhrasesRepository(mockPhraseDao) {
            override fun hasReliablePhrases() = false
        }
        val viewModel = PhrasesViewModel(repo)
        
        assertEquals(PhrasesUiState.Unavailable, viewModel.uiState.value)
    }

    @Test
    fun available_filtersAndSearchesInternally() = runTest {
        val repo = PhrasesRepository(mockPhraseDao)
        val viewModel = PhrasesViewModel(repo)
        
        phrasesFlow.value = listOf(
            PhraseEntity(1, "Biti", "biti", "Hola", "Hello", "GREETING", null, "raw"),
            PhraseEntity(2, "Naksa", "naksa", "Adiós", "Bye", "FAREWELL", null, "raw")
        )
        
        val collectJob = launch(UnconfinedTestDispatcher(testScheduler)) {
            viewModel.uiState.collect {}
        }
        advanceUntilIdle()
        
        var state = viewModel.uiState.value as PhrasesUiState.Success
        assertEquals(2, state.phrases.size)
        
        viewModel.setCategory(PhraseCategory.GREETING)
        advanceUntilIdle()
        state = viewModel.uiState.value as PhrasesUiState.Success
        assertEquals(1, state.phrases.size)
        assertEquals("Biti", state.phrases[0].phraseText)
        
        viewModel.setCategory(null)
        viewModel.setQuery("Adiós")
        advanceUntilIdle()
        state = viewModel.uiState.value as PhrasesUiState.Success
        assertEquals(1, state.phrases.size)
        assertEquals("Naksa", state.phrases[0].phraseText)
        
        collectJob.cancel()
    }
}
