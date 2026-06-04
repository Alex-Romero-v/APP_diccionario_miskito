package org.miskito.dictionary.data.preferences

import org.miskito.dictionary.domain.model.EnglishVisibility
import org.miskito.dictionary.domain.model.FontSizePreference
import org.miskito.dictionary.domain.model.ThemePreference

data class UserPreferences(
    val fontSize: FontSizePreference = FontSizePreference.NORMAL,
    val theme: ThemePreference = ThemePreference.SYSTEM,
    val englishVisibility: EnglishVisibility = EnglishVisibility.DETAIL_ONLY
)
