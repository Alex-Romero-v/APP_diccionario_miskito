package org.miskito.dictionary.data.repository

import kotlinx.coroutines.flow.Flow
import org.miskito.dictionary.data.preferences.UserPreferences
import org.miskito.dictionary.data.preferences.UserPreferencesDataSource
import org.miskito.dictionary.domain.model.EnglishVisibility
import org.miskito.dictionary.domain.model.FontSizePreference
import org.miskito.dictionary.domain.model.ThemePreference

class SettingsRepository(
    private val userPreferencesDataSource: UserPreferencesDataSource
) {
    val userPreferencesFlow: Flow<UserPreferences> = userPreferencesDataSource.userPreferencesFlow

    suspend fun updateFontSize(fontSize: FontSizePreference) {
        userPreferencesDataSource.setFontSize(fontSize)
    }

    suspend fun updateTheme(theme: ThemePreference) {
        userPreferencesDataSource.setTheme(theme)
    }

    suspend fun updateEnglishVisibility(visibility: EnglishVisibility) {
        userPreferencesDataSource.setEnglishVisibility(visibility)
    }
}
