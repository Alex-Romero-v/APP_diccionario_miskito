package org.miskito.dictionary.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import org.miskito.dictionary.data.repository.HistoryRepository
import org.miskito.dictionary.domain.model.HistoryEntry
import javax.inject.Inject

sealed class HistoryUiState {
    object Loading : HistoryUiState()
    object Empty : HistoryUiState()
    data class Success(val history: List<HistoryEntry>) : HistoryUiState()
}

@HiltViewModel
class HistoryViewModel @Inject constructor(
    private val historyRepository: HistoryRepository
) : ViewModel() {

    val uiState: StateFlow<HistoryUiState> = historyRepository.observeHistory()
        .map { list ->
            if (list.isEmpty()) HistoryUiState.Empty else HistoryUiState.Success(list)
        }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = HistoryUiState.Loading
        )

    fun clearHistory() {
        viewModelScope.launch {
            historyRepository.clearHistory()
        }
    }
}
