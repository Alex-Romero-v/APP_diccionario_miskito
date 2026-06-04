package org.miskito.dictionary.domain.normalizer

import javax.inject.Inject

class MiskitoTextNormalizer @Inject constructor() : TextNormalizer {
    override fun normalizeForSearch(input: String): String {
        return input.lowercase()
            .trim()
            .replace(Regex("\\s+"), " ")
            .replace("â", "a")
            .replace("ê", "e")
            .replace("î", "i")
            .replace("ô", "o")
            .replace("û", "u")
            .replace("á", "a")
            .replace("é", "e")
            .replace("í", "i")
            .replace("ó", "o")
            .replace("ú", "u")
            .replace(Regex("[^a-z0-9\\- ]"), "") // Remove non-alphanumeric except hyphen and space
    }
}
