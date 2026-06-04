package org.miskito.dictionary.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.FlowPreview
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import org.miskito.dictionary.data.repository.DictionaryRepository
import org.miskito.dictionary.domain.model.SearchFilter
import org.miskito.dictionary.domain.model.SearchResult
import javax.inject.Inject

sealed class SearchUiState {
    object Initial : SearchUiState()
    object TooShort : SearchUiState()
    object Loading : SearchUiState()
    data class Success(val results: List<SearchResult>) : SearchUiState()
    object Empty : SearchUiState()
    data class Error(val message: String) : SearchUiState()
}

@OptIn(FlowPreview::class, ExperimentalCoroutinesApi::class)
@HiltViewModel
class SearchViewModel @Inject constructor(
    private val dictionaryRepository: DictionaryRepository
) : ViewModel() {

    private val _query = MutableStateFlow("")
    val query: StateFlow<String> = _query.asStateFlow()

    private val _filter = MutableStateFlow(SearchFilter.ALL)
    val filter: StateFlow<SearchFilter> = _filter.asStateFlow()

    private val _isSearchActive = MutableStateFlow(false)
    val isSearchActive: StateFlow<Boolean> = _isSearchActive.asStateFlow()

    fun setQuery(newQuery: String) {
        _query.value = newQuery
    }

    fun setFilter(newFilter: SearchFilter) {
        _filter.value = newFilter
    }

    val uiState: StateFlow<SearchUiState> = combine(_query, _filter) { q, f ->
        Pair(q, f)
    }
    .debounce(300)
    .distinctUntilChanged()
    .flatMapLatest { (q, f) ->
        val trimmed = q.trim()
        if (trimmed.isEmpty()) {
            flowOf(SearchUiState.Initial)
        } else if (trimmed.length < 2) {
            flowOf(SearchUiState.TooShort)
        } else {
            flow {
                emit(SearchUiState.Loading)
                try {
                    val results = dictionaryRepository.search(trimmed, f)
                    if (results.isEmpty()) {
                        emit(SearchUiState.Empty)
                    } else {
                        emit(SearchUiState.Success(results))
                    }
                } catch (e: Exception) {
                    emit(SearchUiState.Error(e.message ?: "Unknown error"))
                }
            }
        }
    }
    .stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = SearchUiState.Initial
    )

    fun onQueryChange(newQuery: String) {
        _query.value = newQuery
    }

    fun onFilterChange(newFilter: SearchFilter) {
        _filter.value = newFilter
    }

    fun onSearchActiveChange(active: Boolean) {
        _isSearchActive.value = active
    }
}
