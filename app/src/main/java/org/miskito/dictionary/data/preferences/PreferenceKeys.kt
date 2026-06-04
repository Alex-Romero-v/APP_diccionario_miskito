package org.miskito.dictionary.data.preferences

import androidx.datastore.preferences.core.stringPreferencesKey

object PreferenceKeys {
    val FONT_SIZE = stringPreferencesKey("font_size")
    val THEME = stringPreferencesKey("theme")
    val ENGLISH_VISIBILITY = stringPreferencesKey("english_visibility")
}
