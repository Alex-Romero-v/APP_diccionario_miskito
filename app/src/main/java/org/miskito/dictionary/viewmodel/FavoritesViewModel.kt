package org.miskito.dictionary.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import org.miskito.dictionary.data.repository.FavoritesRepository
import org.miskito.dictionary.domain.model.FavoriteEntry
import javax.inject.Inject

sealed class FavoritesUiState {
    object Loading : FavoritesUiState()
    object Empty : FavoritesUiState()
    data class Success(val favorites: List<FavoriteEntry>) : FavoritesUiState()
}

@HiltViewModel
class FavoritesViewModel @Inject constructor(
    private val favoritesRepository: FavoritesRepository
) : ViewModel() {

    val uiState: StateFlow<FavoritesUiState> = favoritesRepository.observeFavorites()
        .map { list ->
            if (list.isEmpty()) FavoritesUiState.Empty else FavoritesUiState.Success(list)
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = FavoritesUiState.Loading
        )

    fun removeFavorite(entryId: Long) {
        viewModelScope.launch {
            favoritesRepository.removeFavorite(entryId)
        }
    }
}
