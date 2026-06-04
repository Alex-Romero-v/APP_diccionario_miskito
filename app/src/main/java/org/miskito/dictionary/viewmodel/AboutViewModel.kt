package org.miskito.dictionary.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import org.miskito.dictionary.data.repository.MetadataRepository
import org.miskito.dictionary.domain.model.DictionaryMetadata
import javax.inject.Inject

data class AboutUiState(
    val metadata: DictionaryMetadata? = null,
    val baseText: String = "Módulo de diccionario desarrollado para Google AI Studio.",
    val licenseNotice: String = "All terms and rights belong to their respective original authors. No new license is invented or claimed by this software."
)

@HiltViewModel
class AboutViewModel @Inject constructor(
    private val metadataRepository: MetadataRepository
) : ViewModel() {

    val uiState: StateFlow<AboutUiState> = metadataRepository.observeMetadata()
        .map { meta ->
            AboutUiState(metadata = meta)
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = AboutUiState()
        )
}
