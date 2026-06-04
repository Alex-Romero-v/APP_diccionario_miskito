package org.miskito.dictionary.domain.search

import org.junit.Assert.assertEquals
import org.junit.Test
import org.miskito.dictionary.domain.normalizer.MiskitoTextNormalizer

class SearchQueryParserTest {

    private val normalizer = MiskitoTextNormalizer()
    private val parser = SearchQueryParser(normalizer)

    @Test
    fun parse_emptyString_returnsEmpty() {
        assertEquals(ParsedQuery.Empty, parser.parse(""))
        assertEquals(ParsedQuery.Empty, parser.parse("   "))
    }

    @Test
    fun parse_oneCharacter_returnsTooShort() {
        assertEquals(ParsedQuery.TooShort, parser.parse("a"))
        assertEquals(ParsedQuery.TooShort, parser.parse(" â "))
    }

    @Test
    fun parse_validQuery_returnsNormalized() {
        assertEquals(ParsedQuery.Valid("bila"), parser.parse(" BÎLA "))
        assertEquals(ParsedQuery.Valid("bila"), parser.parse("bîla."))
    }
}
