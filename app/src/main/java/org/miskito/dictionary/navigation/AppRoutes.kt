package org.miskito.dictionary.navigation

object AppRoutes {
    const val SEARCH = "search"
    const val ENTRY = "entry/{entryId}"
    
    fun createEntryRoute(entryId: Long): String {
        return "entry/$entryId"
    }

    const val FAVORITES = "favorites"
    const val HISTORY = "history"
    const val PHRASES = "phrases"
    const val SETTINGS = "settings"
    const val ABOUT = "about"
}
