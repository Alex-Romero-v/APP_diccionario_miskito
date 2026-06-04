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
import org.miskito.dictionary.data.local.dao.FavoriteDao
import org.miskito.dictionary.data.local.entity.FavoriteEntity
import org.miskito.dictionary.data.repository.FavoritesRepository
import org.miskito.dictionary.domain.model.FavoriteEntry

@OptIn(ExperimentalCoroutinesApi::class)
class FavoritesViewModelTest {

    private val testDispatcher = StandardTestDispatcher()

    private val favoritesFlow = MutableStateFlow<List<FavoriteEntity>>(emptyList())
    private var removedId: Long? = null

    private val mockFavoriteDao = object : FavoriteDao {
        override fun observeFavorites() = favoritesFlow
        override fun observeIsFavorite(entryId: Long) = MutableStateFlow(false)
        override suspend fun isFavorite(entryId: Long): Boolean = false
        override suspend fun addFavorite(favorite: FavoriteEntity) {}
        override suspend fun removeFavorite(entryId: Long) { removedId = entryId }
    }

    private lateinit var repository: FavoritesRepository
    private lateinit var viewModel: FavoritesViewModel

    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        repository = FavoritesRepository(mockFavoriteDao)
        viewModel = FavoritesViewModel(repository)
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
        // since favoritesFlow emits emptyList immediately, it maps to Empty right away
        assertTrue(state is FavoritesUiState.Empty || state is FavoritesUiState.Loading)
        collectJob.cancel()
    }

    @Test
    fun updateFavorites_emitsSuccess() = runTest {
        val collectJob = launch(UnconfinedTestDispatcher(testScheduler)) {
            viewModel.uiState.collect {}
        }
        
        favoritesFlow.value = listOf(FavoriteEntity(1L, "now"))
        advanceUntilIdle()

        val state = viewModel.uiState.value
        assertTrue(state is FavoritesUiState.Success)
        assertEquals(1, (state as FavoritesUiState.Success).favorites.size)
        collectJob.cancel()
    }

    @Test
    fun removeFavorite_callsRepository() = runTest {
        viewModel.removeFavorite(1L)
        advanceUntilIdle()
        assertEquals(1L, removedId)
    }
}
