package org.miskito.dictionary.domain.normalizer

interface TextNormalizer {
    fun normalizeForSearch(input: String): String
}
