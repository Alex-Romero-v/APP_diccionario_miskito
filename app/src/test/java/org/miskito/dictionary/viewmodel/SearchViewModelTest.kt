package org.miskito.dictionary.viewmodel

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.toList
import kotlinx.coroutines.launch
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.miskito.dictionary.data.local.dao.EntryDao
import org.miskito.dictionary.data.local.dao.MetadataDao
import org.miskito.dictionary.data.local.dao.SearchDao
import org.miskito.dictionary.data.local.entity.*
import org.miskito.dictionary.data.local.relation.EntryDetailRelation
import org.miskito.dictionary.data.local.relation.SearchResultProjection
import org.miskito.dictionary.data.repository.DictionaryRepository
import org.miskito.dictionary.domain.model.SearchFilter
import kotlinx.coroutines.flow.flowOf

@OptIn(ExperimentalCoroutinesApi::class)
class SearchViewModelTest {

    private val testDispatcher = StandardTestDispatcher()

    private val mockEntryDao = object : EntryDao {
        override suspend fun getEntryById(id: Long): EntryEntity? = null
        override suspend fun getTranslations(entryId: Long): List<TranslationEntity> = emptyList()
        override suspend fun getVariants(entryId: Long): List<VariantEntity> = emptyList()
        override suspend fun getExamples(entryId: Long): List<ExampleEntity> = emptyList()
        override suspend fun getNotes(entryId: Long): List<NoteEntity> = emptyList()
        override suspend fun getReferencesForEntry(entryId: Long): List<EntryReferenceEntity> = emptyList()
        override suspend fun getEntryDetail(id: Long): EntryDetailRelation? = null
    }

    private val mockMetadataDao = object : MetadataDao {
        override suspend fun getValue(key: String): String? = null
        override fun observeAllMetadata() = flowOf(emptyList<MetadataEntity>())
    }

    private lateinit var searchDao: MockSearchDao
    private lateinit var repository: DictionaryRepository
    private lateinit var viewModel: SearchViewModel

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        searchDao = MockSearchDao()
        repository = DictionaryRepository(mockEntryDao, searchDao, mockMetadataDao)
        viewModel = SearchViewModel(repository)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun initialState_isInitial() = runTest {
        assertEquals(SearchUiState.Initial, viewModel.uiState.value)
    }

    @Test
    fun shortQuery_emitsTooShort() = runTest {
        val collectJob = launch(UnconfinedTestDispatcher(testScheduler)) {
            viewModel.uiState.collect {}
        }
        viewModel.onQueryChange("a")
        advanceTimeBy(400) // debounce
        val state = viewModel.uiState.value
        assertEquals(SearchUiState.TooShort, state)
        collectJob.cancel()
    }

    @Test
    fun validQueryWithNoResults_emitsEmpty() = runTest {
        searchDao.results = emptyList()
        val collectJob = launch(UnconfinedTestDispatcher(testScheduler)) {
            viewModel.uiState.collect {}
        }
        viewModel.onQueryChange("test")
        advanceTimeBy(400) // debounce
        val state = viewModel.uiState.value
        assertEquals(SearchUiState.Empty, state)
        collectJob.cancel()
    }

    @Test
    fun validQueryWithResults_emitsSuccess() = runTest {
        searchDao.results = listOf(createMockResult("test"))
        val collectJob = launch(UnconfinedTestDispatcher(testScheduler)) {
            viewModel.uiState.collect {}
        }
        viewModel.onQueryChange("test")
        advanceUntilIdle() // let debounce and coroutine finish
        
        val state = viewModel.uiState.value
        assertTrue(state is SearchUiState.Success)
        assertEquals(1, (state as SearchUiState.Success).results.size)
        collectJob.cancel()
    }

    class MockSearchDao : SearchDao {
        var results = emptyList<SearchResultProjection>()
        override suspend fun searchAll(normalizedQuery: String, rawQuery: String, limit: Int) = results
        override suspend fun searchMiskito(normalizedQuery: String, rawQuery: String, limit: Int) = results
        override suspend fun searchSpanish(normalizedQuery: String, rawQuery: String, limit: Int) = results
        override suspend fun searchEnglish(normalizedQuery: String, rawQuery: String, limit: Int) = results
    }

    private fun createMockResult(text: String) = SearchResultProjection(
        entryId = 1,
        headword = text,
        normalizedHeadword = text,
        sortKey = text,
        partOfSpeech = "n",
        spanishTranslation = "prueba",
        hasExamples = false,
        hasNotes = false,
        hasVariants = false
    )
}
