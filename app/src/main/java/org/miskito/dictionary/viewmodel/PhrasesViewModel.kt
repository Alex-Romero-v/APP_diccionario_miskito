package org.miskito.dictionary.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import org.miskito.dictionary.data.repository.PhrasesRepository
import org.miskito.dictionary.domain.model.Phrase
import org.miskito.dictionary.domain.model.PhraseCategory
import javax.inject.Inject

sealed class PhrasesUiState {
    object Loading : PhrasesUiState()
    object Unavailable : PhrasesUiState()
    data class Success(
        val phrases: List<Phrase>,
        val currentCategory: PhraseCategory?,
        val query: String
    ) : PhrasesUiState()
}

@HiltViewModel
class PhrasesViewModel @Inject constructor(
    private val phrasesRepository: PhrasesRepository
) : ViewModel() {

    private val selectedCategory = MutableStateFlow<PhraseCategory?>(null)
    private val searchQuery = MutableStateFlow("")

    val uiState: StateFlow<PhrasesUiState> = if (!phrasesRepository.hasReliablePhrases()) {
        MutableStateFlow(PhrasesUiState.Unavailable)
    } else {
        combine(
            phrasesRepository.observePhrases(),
            selectedCategory,
            searchQuery
        ) { phrases, category, query ->
            var filtered = phrases

            if (category != null) {
                filtered = filtered.filter { it.category == category }
            }

            if (query.isNotBlank()) {
                val lowerQuery = query.lowercase()
                filtered = filtered.filter { phrase ->
                    phrase.phraseText.lowercase().contains(lowerQuery) ||
                            (phrase.spanishText?.lowercase()?.contains(lowerQuery) == true) ||
                            (phrase.englishText?.lowercase()?.contains(lowerQuery) == true)
                }
            }

            PhrasesUiState.Success(
                phrases = filtered,
                currentCategory = category,
                query = query
            )
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = PhrasesUiState.Loading
        )
    }

    fun setCategory(category: PhraseCategory?) {
        selectedCategory.value = category
    }

    fun setQuery(query: String) {
        searchQuery.value = query
    }
}
