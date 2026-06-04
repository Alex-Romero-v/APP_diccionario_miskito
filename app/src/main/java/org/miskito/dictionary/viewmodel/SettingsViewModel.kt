package org.miskito.dictionary.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import org.miskito.dictionary.data.repository.HistoryRepository
import org.miskito.dictionary.data.repository.MetadataRepository
import org.miskito.dictionary.data.repository.SettingsRepository
import org.miskito.dictionary.BuildConfig
import org.miskito.dictionary.domain.model.EnglishVisibility
import org.miskito.dictionary.domain.model.FontSizePreference
import org.miskito.dictionary.domain.model.ThemePreference
import javax.inject.Inject

data class SettingsUiState(
    val fontSize: FontSizePreference = FontSizePreference.NORMAL,
    val theme: ThemePreference = ThemePreference.SYSTEM,
    val englishVisibility: EnglishVisibility = EnglishVisibility.DETAIL_ONLY,
    val appVersion: String = "1.0.0",
    val dbVersion: String = "1.0"
)

@HiltViewModel
class SettingsViewModel @Inject constructor(
    private val settingsRepository: SettingsRepository,
    private val historyRepository: HistoryRepository,
    private val metadataRepository: MetadataRepository
) : ViewModel() {

    val uiState: StateFlow<SettingsUiState> = combine(
        settingsRepository.userPreferencesFlow,
        metadataRepository.observeMetadata()
    ) { prefs, metadata ->
        SettingsUiState(
            fontSize = prefs.fontSize,
            theme = prefs.theme,
            englishVisibility = prefs.englishVisibility,
            appVersion = BuildConfig.VERSION_NAME,
            dbVersion = metadata.databaseVersion
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = SettingsUiState(appVersion = BuildConfig.VERSION_NAME)
    )

    fun changeFontSize(size: FontSizePreference) {
        viewModelScope.launch {
            settingsRepository.updateFontSize(size)
        }
    }

    fun toggleTheme(theme: ThemePreference) {
        viewModelScope.launch {
            settingsRepository.updateTheme(theme)
        }
    }

    fun toggleEnglishValidations(visibility: EnglishVisibility) {
        viewModelScope.launch {
            settingsRepository.updateEnglishVisibility(visibility)
        }
    }

    fun clearHistory() {
        viewModelScope.launch {
            historyRepository.clearHistory()
        }
    }
}
