package org.miskito.dictionary.viewmodel

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.*
import org.junit.After
import org.junit.Assert.*
import org.junit.Before
import org.junit.Test
import org.miskito.dictionary.data.local.dao.*
import org.miskito.dictionary.data.local.entity.*
import org.miskito.dictionary.data.local.relation.EntryDetailRelation
import org.miskito.dictionary.data.repository.DictionaryRepository
import org.miskito.dictionary.data.repository.FavoritesRepository
import org.miskito.dictionary.data.repository.HistoryRepository

@OptIn(ExperimentalCoroutinesApi::class)
class EntryDetailViewModelTest {

    private val testDispatcher = StandardTestDispatcher()

    private var historyAddedId: Long? = null

    private val mockEntryDao = object : EntryDao {
        override suspend fun getEntryById(id: Long): EntryEntity? = null
        override suspend fun getTranslations(entryId: Long): List<TranslationEntity> = emptyList()
        override suspend fun getVariants(entryId: Long): List<VariantEntity> = emptyList()
        override suspend fun getExamples(entryId: Long): List<ExampleEntity> = emptyList()
        override suspend fun getNotes(entryId: Long): List<NoteEntity> = emptyList()
        override suspend fun getReferencesForEntry(entryId: Long): List<EntryReferenceEntity> = emptyList()
        override suspend fun getEntryDetail(id: Long): EntryDetailRelation? {
            return if (id == 1L) {
                EntryDetailRelation(
                    entry = EntryEntity(1, "test", "test", "test", "n", null, null, null, null, "", "", "", false, false, false, "now", "now"),
                    translations = emptyList(),
                    variants = emptyList(),
                    examples = emptyList(),
                    notes = emptyList(),
                    references = emptyList()
                )
            } else null
        }
    }
    
    private val mockSearchDao = object : SearchDao {
        override suspend fun searchAll(normalizedQuery: String, rawQuery: String, limit: Int) = emptyList<org.miskito.dictionary.data.local.relation.SearchResultProjection>()
        override suspend fun searchMiskito(normalizedQuery: String, rawQuery: String, limit: Int) = emptyList<org.miskito.dictionary.data.local.relation.SearchResultProjection>()
        override suspend fun searchSpanish(normalizedQuery: String, rawQuery: String, limit: Int) = emptyList<org.miskito.dictionary.data.local.relation.SearchResultProjection>()
        override suspend fun searchEnglish(normalizedQuery: String, rawQuery: String, limit: Int) = emptyList<org.miskito.dictionary.data.local.relation.SearchResultProjection>()
    }

    private val mockMetadataDao = object : MetadataDao {
        override suspend fun getValue(key: String): String? = null
        override fun observeAllMetadata() = flowOf(emptyList<MetadataEntity>())
    }

    private val mockFavoriteDao = object : FavoriteDao {
        var isFav = false
        override fun observeFavorites() = flowOf(emptyList<FavoriteEntity>())
        override fun observeIsFavorite(entryId: Long) = flowOf(isFav)
        override suspend fun isFavorite(entryId: Long): Boolean = isFav
        override suspend fun addFavorite(favorite: FavoriteEntity) { isFav = true }
        override suspend fun removeFavorite(entryId: Long) { isFav = false }
    }

    private val mockHistoryDao = object : HistoryDao {
        override fun observeHistory() = flowOf(emptyList<HistoryEntity>())
        override suspend fun getHistoryCount(entryId: Long): Int? = 0
        override suspend fun insertOrUpdateHistory(history: HistoryEntity) { historyAddedId = history.entryId }
        override suspend fun clearHistory() {}
    }

    private lateinit var dictionaryRepository: DictionaryRepository
    private lateinit var favoritesRepository: FavoritesRepository
    private lateinit var historyRepository: HistoryRepository
    private lateinit var viewModel: EntryDetailViewModel


    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        historyAddedId = null
        mockFavoriteDao.isFav = false
        dictionaryRepository = DictionaryRepository(mockEntryDao, mockSearchDao, mockMetadataDao)
        favoritesRepository = FavoritesRepository(mockFavoriteDao)
        historyRepository = HistoryRepository(mockHistoryDao)
        viewModel = EntryDetailViewModel(dictionaryRepository, favoritesRepository, historyRepository)
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun loadInexistentEntry_emitsNotFound_doesNotRegisterHistory() = runTest {
        viewModel.loadEntry(2L)
        advanceUntilIdle()
        
        assertEquals(EntryDetailUiState.NotFound, viewModel.uiState.value)
        assertNull(historyAddedId)
    }

    @Test
    fun loadValidEntry_emitsSuccess_registersHistory() = runTest {
        viewModel.loadEntry(1L)
        advanceUntilIdle()
        
        val state = viewModel.uiState.value
        assertTrue(state is EntryDetailUiState.Success)
        assertEquals(1L, historyAddedId)
    }

    @Test
    fun toggleFavorite_changesState() = runTest {
        viewModel.loadEntry(1L)
        advanceUntilIdle()

        var state = viewModel.uiState.value as EntryDetailUiState.Success
        assertFalse(state.isFavorite)

        viewModel.toggleFavorite(1L)
        advanceUntilIdle()

        state = viewModel.uiState.value as EntryDetailUiState.Success
        assertTrue(state.isFavorite)
        assertTrue(mockFavoriteDao.isFav)
    }
}
