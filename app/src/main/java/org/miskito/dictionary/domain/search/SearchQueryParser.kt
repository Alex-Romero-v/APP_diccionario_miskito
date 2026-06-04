package org.miskito.dictionary.domain.search

import org.miskito.dictionary.domain.normalizer.TextNormalizer

sealed interface ParsedQuery {
    data object Empty : ParsedQuery
    data object TooShort : ParsedQuery
    data class Valid(val normalizedQuery: String) : ParsedQuery
}

class SearchQueryParser(private val normalizer: TextNormalizer) {
    fun parse(rawQuery: String): ParsedQuery {
        val trimmed = rawQuery.trim()
        if (trimmed.isEmpty()) {
            return ParsedQuery.Empty
        }
        
        val normalized = normalizer.normalizeForSearch(trimmed)
        if (normalized.length < 2) {
            return ParsedQuery.TooShort
        }
        
        return ParsedQuery.Valid(normalizedQuery = normalized)
    }
}
