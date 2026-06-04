package org.miskito.dictionary.data.preferences

import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import org.miskito.dictionary.domain.model.EnglishVisibility
import org.miskito.dictionary.domain.model.FontSizePreference
import org.miskito.dictionary.domain.model.ThemePreference

class UserPreferencesDataSource(
    private val dataStore: DataStore<Preferences>
) {
    val userPreferencesFlow: Flow<UserPreferences> = dataStore.data.map { preferences ->
        UserPreferences(
            fontSize = runCatching { FontSizePreference.valueOf(preferences[PreferenceKeys.FONT_SIZE] ?: "NORMAL") }
                .getOrDefault(FontSizePreference.NORMAL),
            theme = runCatching { ThemePreference.valueOf(preferences[PreferenceKeys.THEME] ?: "SYSTEM") }
                .getOrDefault(ThemePreference.SYSTEM),
            englishVisibility = runCatching { EnglishVisibility.valueOf(preferences[PreferenceKeys.ENGLISH_VISIBILITY] ?: "DETAIL_ONLY") }
                .getOrDefault(EnglishVisibility.DETAIL_ONLY)
        )
    }

    suspend fun setFontSize(fontSize: FontSizePreference) {
        dataStore.edit { preferences ->
            preferences[PreferenceKeys.FONT_SIZE] = fontSize.name
        }
    }

    suspend fun setTheme(theme: ThemePreference) {
        dataStore.edit { preferences ->
            preferences[PreferenceKeys.THEME] = theme.name
        }
    }

    suspend fun setEnglishVisibility(visibility: EnglishVisibility) {
        dataStore.edit { preferences ->
            preferences[PreferenceKeys.ENGLISH_VISIBILITY] = visibility.name
        }
    }
}
