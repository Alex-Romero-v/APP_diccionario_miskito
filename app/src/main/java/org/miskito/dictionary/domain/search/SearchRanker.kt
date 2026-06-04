package org.miskito.dictionary.domain.search

import javax.inject.Inject

class SearchRanker @Inject constructor() {

    fun getWeight(matchType: SearchMatchType): Int {
        return when (matchType) {
            SearchMatchType.EXACT_HEADWORD -> SearchConstants.WEIGHT_EXACT_HEADWORD
            SearchMatchType.EXACT_NORMALIZED_HEADWORD -> SearchConstants.WEIGHT_EXACT_NORMALIZED_HEADWORD
            SearchMatchType.EXACT_VARIANT -> SearchConstants.WEIGHT_EXACT_VARIANT
            SearchMatchType.PREFIX_HEADWORD -> SearchConstants.WEIGHT_PREFIX_HEADWORD
            SearchMatchType.PREFIX_VARIANT -> SearchConstants.WEIGHT_PREFIX_VARIANT
            SearchMatchType.SPANISH_TRANSLATION -> SearchConstants.WEIGHT_SPANISH_TRANSLATION
            SearchMatchType.ENGLISH_TRANSLATION -> SearchConstants.WEIGHT_ENGLISH_TRANSLATION
            SearchMatchType.EXAMPLES -> SearchConstants.WEIGHT_EXAMPLES
            SearchMatchType.NOTES -> SearchConstants.WEIGHT_NOTES
            SearchMatchType.NONE -> 0
        }
    }

    fun <T> rank(
        items: List<T>,
        matchTypeSelector: (T) -> SearchMatchType,
        sortKeySelector: (T) -> String,
        entryIdSelector: (T) -> Long
    ): List<T> {
        return items.sortedWith(comparator(matchTypeSelector, sortKeySelector, entryIdSelector))
    }

    fun <T> comparator(
        matchTypeSelector: (T) -> SearchMatchType,
        sortKeySelector: (T) -> String,
        entryIdSelector: (T) -> Long
    ): Comparator<T> {
        return compareByDescending<T> { getWeight(matchTypeSelector(it)) }
            .thenBy { sortKeySelector(it) }
            .thenBy { entryIdSelector(it) }
    }
}
