package org.miskito.dictionary.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import org.miskito.dictionary.data.local.dao.EntryDao
import org.miskito.dictionary.data.local.dao.MetadataDao
import org.miskito.dictionary.data.local.dao.SearchDao
import org.miskito.dictionary.data.local.relation.EntryDetailRelation
import org.miskito.dictionary.domain.model.*

class DictionaryRepository(
    private val entryDao: EntryDao,
    private val searchDao: SearchDao,
    private val metadataDao: MetadataDao
) {

    suspend fun search(query: String, filter: SearchFilter = SearchFilter.ALL, limit: Int = 100): List<SearchResult> {
        val trimmedQuery = query.trim()
        if (trimmedQuery.isEmpty()) return emptyList()
        
        // FTS normalization (simple lowercase for match, remove punctuation)
        val normalizedQuery = trimmedQuery.lowercase().replace(Regex("[^a-z0-9]"), " ") + "*"
        val rawQuery = trimmedQuery + "*"
        
        val results = when (filter) {
            SearchFilter.ALL -> searchDao.searchAll(normalizedQuery, rawQuery, limit)
            SearchFilter.MISKITO -> searchDao.searchMiskito(normalizedQuery, rawQuery, limit)
            SearchFilter.SPANISH -> searchDao.searchSpanish(normalizedQuery, rawQuery, limit)
            SearchFilter.ENGLISH -> searchDao.searchEnglish(normalizedQuery, rawQuery, limit)
        }
        
        // Ranking: exact match first, prefix match second, general match last
        return results.map { it.toDomainModel() }
            .sortedBy { result ->
                when {
                    result.headword.equals(trimmedQuery, ignoreCase = true) -> 0
                    result.headword.startsWith(trimmedQuery, ignoreCase = true) -> 1
                    else -> 2
                }
            }
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
