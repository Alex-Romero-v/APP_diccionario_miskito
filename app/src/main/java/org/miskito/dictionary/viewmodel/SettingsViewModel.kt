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
import org.miskito.dictionary.data.repository.SettingsRepository
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
    private val historyRepository: HistoryRepository
) : ViewModel() {

    val uiState: StateFlow<SettingsUiState> = settingsRepository.userPreferencesFlow
        .map { prefs ->
            SettingsUiState(
                fontSize = prefs.fontSize,
                theme = prefs.theme,
                englishVisibility = prefs.englishVisibility,
                appVersion = "1.0.0",
                dbVersion = "1.0"
            )
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = SettingsUiState()
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
