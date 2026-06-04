package org.miskito.dictionary.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import org.miskito.dictionary.data.local.dao.EntryDao
import org.miskito.dictionary.data.local.dao.MetadataDao
import org.miskito.dictionary.data.local.dao.SearchDao
import org.miskito.dictionary.data.local.relation.EntryDetailRelation
import org.miskito.dictionary.domain.model.*
import org.miskito.dictionary.domain.normalizer.TextNormalizer
import org.miskito.dictionary.domain.search.SearchMatchType
import org.miskito.dictionary.domain.search.SearchRanker

class DictionaryRepository(
    private val entryDao: EntryDao,
    private val searchDao: SearchDao,
    private val metadataDao: MetadataDao,
    private val normalizer: TextNormalizer,
    private val ranker: SearchRanker
) {

    suspend fun search(query: String, filter: SearchFilter = SearchFilter.ALL, limit: Int = 100): List<SearchResult> {
        val trimmedQuery = query.trim()
        if (trimmedQuery.isEmpty()) return emptyList()
        
        val normalizedQueryStr = normalizer.normalizeForSearch(trimmedQuery)
        
        val buildScopedFtsQuery = { columnScope: String? ->
            val scopedNorm = normalizedQueryStr.split(Regex("\\s+")).filter { it.isNotBlank() }
                .joinToString(" ") { if (columnScope != null) "$columnScope:$it*" else "$it*" }
            
            val scopedRaw = trimmedQuery.split(Regex("\\s+")).filter { it.isNotBlank() }
                .joinToString(" ") { if (columnScope != null) "$columnScope:$it*" else "$it*" }
                
            if (normalizedQueryStr.isNotBlank() && normalizedQueryStr != trimmedQuery) {
                "$scopedNorm OR $scopedRaw"
            } else {
                scopedRaw
            }
        }
        
        val results = when (filter) {
            SearchFilter.ALL -> searchDao.searchAll(buildScopedFtsQuery(null), limit)
            SearchFilter.SPANISH -> searchDao.searchAll(buildScopedFtsQuery("spanish_text"), limit)
            SearchFilter.ENGLISH -> searchDao.searchAll(buildScopedFtsQuery("english_text"), limit)
            SearchFilter.MISKITO -> searchDao.searchAll(buildScopedFtsQuery("headword"), limit)
        }

        
        val matchTypeSelector: (org.miskito.dictionary.data.local.relation.SearchResultProjection) -> SearchMatchType = { result ->
            when {
                result.headword.equals(trimmedQuery, ignoreCase = true) -> SearchMatchType.EXACT_HEADWORD
                result.normalizedHeadword.equals(normalizedQueryStr, ignoreCase = true) -> SearchMatchType.EXACT_NORMALIZED_HEADWORD
                result.ftsVariantsText?.split(" ")?.any { normalizer.normalizeForSearch(it) == normalizedQueryStr } == true -> SearchMatchType.EXACT_VARIANT
                result.headword.startsWith(trimmedQuery, ignoreCase = true) -> SearchMatchType.PREFIX_HEADWORD
                result.normalizedHeadword.startsWith(normalizedQueryStr, ignoreCase = true) -> SearchMatchType.PREFIX_HEADWORD
                result.ftsVariantsText?.split(" ")?.any { normalizer.normalizeForSearch(it).startsWith(normalizedQueryStr) } == true -> SearchMatchType.PREFIX_VARIANT
                result.ftsSpanishText?.contains(normalizedQueryStr, ignoreCase = true) == true || result.spanishTranslation?.contains(trimmedQuery, ignoreCase = true) == true -> SearchMatchType.SPANISH_TRANSLATION
                result.ftsEnglishText?.contains(normalizedQueryStr, ignoreCase = true) == true -> SearchMatchType.ENGLISH_TRANSLATION
                result.ftsExamplesText?.contains(normalizedQueryStr, ignoreCase = true) == true -> SearchMatchType.EXAMPLES
                result.ftsNotesText?.contains(normalizedQueryStr, ignoreCase = true) == true -> SearchMatchType.NOTES
                else -> SearchMatchType.NONE
            }
        }
        
        val rankedResults = ranker.rank(
            items = results,
            matchTypeSelector = matchTypeSelector,
            sortKeySelector = { it.sortKey },
            entryIdSelector = { it.entryId }
        )
        
        return rankedResults.map { it.toDomainModel() }
    }

    suspend fun getEntryDetail(id: Long): DictionaryEntryDetail? {
        val relation: EntryDetailRelation = entryDao.getEntryDetail(id) ?: return null
        
        return DictionaryEntryDetail(
            entry = relation.entry.toDomainModel(),
            translations = relation.translations.map { it.toDomainModel() },
            variants = relation.variants.map { it.toDomainModel() },
            examples = relation.examples.map { it.toDomainModel() },
            notes = relation.notes.map { it.toDomainModel() },
            references = relation.references.map { it.toDomainModel() }
        )
    }

    suspend fun getEntryById(id: Long): DictionaryEntry? {
        return entryDao.getEntryById(id)?.toDomainModel()
    }
    
    fun observeMetadata(): Flow<DictionaryMetadata> {
        return metadataDao.observeAllMetadata().map { it.toDomainModel() }
    }
}
