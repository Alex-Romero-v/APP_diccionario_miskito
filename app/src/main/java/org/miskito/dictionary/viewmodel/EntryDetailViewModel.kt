package org.miskito.dictionary.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import org.miskito.dictionary.data.repository.DictionaryRepository
import org.miskito.dictionary.data.repository.FavoritesRepository
import org.miskito.dictionary.data.repository.HistoryRepository
import org.miskito.dictionary.domain.model.DictionaryEntryDetail
import javax.inject.Inject

sealed class EntryDetailUiState {
    object Loading : EntryDetailUiState()
    object NotFound : EntryDetailUiState()
    data class Success(val detail: DictionaryEntryDetail, val isFavorite: Boolean) : EntryDetailUiState()
    data class Error(val message: String) : EntryDetailUiState()
}

@HiltViewModel
class EntryDetailViewModel @Inject constructor(
    private val dictionaryRepository: DictionaryRepository,
    private val favoritesRepository: FavoritesRepository,
    private val historyRepository: HistoryRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow<EntryDetailUiState>(EntryDetailUiState.Loading)
    val uiState: StateFlow<EntryDetailUiState> = _uiState.asStateFlow()

    fun loadEntry(entryId: Long) {
        viewModelScope.launch {
            _uiState.value = EntryDetailUiState.Loading
            try {
                val detail = dictionaryRepository.getEntryDetail(entryId)
                if (detail == null) {
                    _uiState.value = EntryDetailUiState.NotFound
                } else {
                    historyRepository.recordOpenedEntry(entryId)
                    val isFav = favoritesRepository.isFavorite(entryId).first()
                    _uiState.value = EntryDetailUiState.Success(detail, isFav)
                }
            } catch (e: Exception) {
                _uiState.value = EntryDetailUiState.Error(e.message ?: "Unknown error")
            }
        }
    }

    fun toggleFavorite(entryId: Long) {
        viewModelScope.launch {
            try {
                val isFav = favoritesRepository.isFavorite(entryId).first()
                if (isFav) {
                    favoritesRepository.removeFavorite(entryId)
                } else {
                    favoritesRepository.addFavorite(entryId)
                }
                
                // Update state if success
                val currentState = _uiState.value
                if (currentState is EntryDetailUiState.Success) {
                    _uiState.value = currentState.copy(isFavorite = !isFav)
                }
            } catch (e: Exception) {
                // handle error or ignore
            }
        }
    }
}
