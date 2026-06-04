package org.miskito.dictionary.domain.search

import org.junit.Assert.assertEquals
import org.junit.Test

class SearchRankerTest {

    data class TestItem(
        val name: String,
        val matchType: SearchMatchType,
        val sortKey: String,
        val entryId: Long
    )

    private fun rankItems(items: List<TestItem>): List<TestItem> {
        val searchRanker = SearchRanker()
        return searchRanker.rank(
            items = items,
            matchTypeSelector = { it.matchType },
            sortKeySelector = { it.sortKey },
            entryIdSelector = { it.entryId }
        )
    }

    @Test
    fun rank_exactHeadwordBeatsTranslation() {
        val exactMatch = TestItem("Exact", SearchMatchType.EXACT_HEADWORD, "a", 1L)
        val translationMatch = TestItem("Translation", SearchMatchType.SPANISH_TRANSLATION, "a", 2L)
        
        val items = listOf(translationMatch, exactMatch)
        val ranked = rankItems(items)
        
        assertEquals("Exact", ranked[0].name)
        assertEquals("Translation", ranked[1].name)
    }

    @Test
    fun rank_exactVariantBeatsExample() {
        val variantMatch = TestItem("Variant", SearchMatchType.EXACT_VARIANT, "a", 1L)
        val exampleMatch = TestItem("Example", SearchMatchType.EXAMPLES, "a", 2L)
        
        val items = listOf(exampleMatch, variantMatch)
        val ranked = rankItems(items)
        
        assertEquals("Variant", ranked[0].name)
        assertEquals("Example", ranked[1].name)
    }

    @Test
    fun rank_sameWeightSortsBySortKey() {
        val itemB = TestItem("B", SearchMatchType.SPANISH_TRANSLATION, "b_sort", 1L)
        val itemA = TestItem("A", SearchMatchType.SPANISH_TRANSLATION, "a_sort", 2L)
        
        val items = listOf(itemB, itemA)
        val ranked = rankItems(items)
        
        assertEquals("A", ranked[0].name)
        assertEquals("B", ranked[1].name)
    }

    @Test
    fun rank_sameSortKeySortsByEntryId() {
        val item2 = TestItem("2", SearchMatchType.SPANISH_TRANSLATION, "same_sort", 2L)
        val item1 = TestItem("1", SearchMatchType.SPANISH_TRANSLATION, "same_sort", 1L)
        
        val items = listOf(item2, item1)
        val ranked = rankItems(items)
        
        assertEquals("1", ranked[0].name)
        assertEquals("2", ranked[1].name)
    }
}
