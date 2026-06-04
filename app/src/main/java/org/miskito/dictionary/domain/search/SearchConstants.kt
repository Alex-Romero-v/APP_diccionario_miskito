package org.miskito.dictionary.domain.search

object SearchConstants {
    const val WEIGHT_EXACT_HEADWORD = 1000
    const val WEIGHT_EXACT_NORMALIZED_HEADWORD = 900
    const val WEIGHT_EXACT_VARIANT = 800
    const val WEIGHT_PREFIX_HEADWORD = 700
    const val WEIGHT_PREFIX_VARIANT = 600
    const val WEIGHT_SPANISH_TRANSLATION = 500
    const val WEIGHT_ENGLISH_TRANSLATION = 400
    const val WEIGHT_EXAMPLES = 300
    const val WEIGHT_NOTES = 200
}
