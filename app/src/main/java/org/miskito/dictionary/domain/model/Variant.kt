package org.miskito.dictionary.domain.model

data class Variant(
    val id: Long,
    val entryId: Long,
    val variantText: String,
    val normalizedVariant: String,
    val variantType: VariantType,
    val note: String?
)
