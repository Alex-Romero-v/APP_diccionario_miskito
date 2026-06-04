package org.miskito.dictionary.domain.normalizer

import org.junit.Assert.assertEquals
import org.junit.Test

class MiskitoTextNormalizerTest {

    private val normalizer = MiskitoTextNormalizer()

    @Test
    fun normalizeForSearch_removesCircumflexAndConvertsToLowerCase() {
        assertEquals("bila", normalizer.normalizeForSearch("BÎLA"))
        assertEquals("gad", normalizer.normalizeForSearch(" Gâd "))
        assertEquals("aisa", normalizer.normalizeForSearch("ÂISA"))
        assertEquals("bila", normalizer.normalizeForSearch("bîla."))
        assertEquals("aisa-yapti", normalizer.normalizeForSearch("aisa-yapti"))
    }
}
