package org.miskito.dictionary.data.repository

import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Test
import org.miskito.dictionary.data.local.dao.EntryDao
import org.miskito.dictionary.data.local.dao.MetadataDao
import org.miskito.dictionary.data.local.dao.SearchDao
import org.miskito.dictionary.data.local.entity.*
import org.miskito.dictionary.data.local.relation.EntryDetailRelation
import org.miskito.dictionary.data.local.relation.SearchResultProjection
import org.miskito.dictionary.domain.model.SearchFilter
import org.miskito.dictionary.domain.normalizer.MiskitoTextNormalizer
import org.miskito.dictionary.domain.search.SearchRanker

class DictionaryRepositoryTest {

    private val mockEntryDao = object : EntryDao {
        override suspend fun getEntryById(id: Long): EntryEntity? {
            if (id == 1L) return createMockEntry()
            return null
        }

        override suspend fun getTranslations(entryId: Long): List<TranslationEntity> = emptyList()
        override suspend fun getVariants(entryId: Long): List<VariantEntity> = emptyList()
        override suspend fun getExamples(entryId: Long): List<ExampleEntity> = emptyList()
        override suspend fun getNotes(entryId: Long): List<NoteEntity> = emptyList()
        override suspend fun getReferencesForEntry(entryId: Long): List<EntryReferenceEntity> = emptyList()

        override suspend fun getEntryDetail(id: Long): EntryDetailRelation? {
            if (id == 1L) {
                return EntryDetailRelation(
                    entry = createMockEntry(),
                    translations = emptyList(),
                    variants = emptyList(),
                    examples = emptyList(),
                    notes = emptyList(),
                    references = emptyList()
                )
            }
            return null
        }
        
        private fun createMockEntry() = EntryEntity(
            id = 1,
            headword = "test",
            normalizedHeadword = "test",
            sortKey = "test",
            entryType = "MAIN_ENTRY",
            parentEntryId = null,
            partOfSpeech = "n",
            rawPartOfSpeech = "n",
            sourcePage = 1,
            rawText = "test text",
            verificationStatus = "VERIFIED",
            extractionConfidence = "HIGH",
            hasExamples = false,
            hasNotes = false,
            hasVariants = false,
            createdAt = "today",
            updatedAt = null
        )
    }
    
    private val mockSearchDao = object : SearchDao {
        override suspend fun searchAll(query: String, limit: Int): List<SearchResultProjection> {
            if (query.contains("test*")) return listOf(createMockResult())
            if (query.contains("ba*")) {
                return listOf(
                    SearchResultProjection(
                        entryId = 2,
                        headword = "aba",
                        normalizedHeadword = "aba",
                        sortKey = "aba",
                        partOfSpeech = "n",
                        spanishTranslation = "baka", // translation
                        hasExamples = false,
                        hasNotes = false,
                        hasVariants = false,
                        ftsSpanishText = "baka"
                    ),
                    SearchResultProjection(
                        entryId = 3,
                        headword = "bâ",
                        normalizedHeadword = "ba",
                        sortKey = "bâ",
                        partOfSpeech = "n",
                        spanishTranslation = "prueba",
                        hasExamples = false,
                        hasNotes = false,
                        hasVariants = false
                    )
                )
            }
            return emptyList()
        }
        
        private fun createMockResult() = SearchResultProjection(
            entryId = 1,
            headword = "test",
            normalizedHeadword = "test",
            sortKey = "test",
            partOfSpeech = "n",
            spanishTranslation = "prueba",
            hasExamples = false,
            hasNotes = false,
            hasVariants = false
        )
    }
    
    private val mockMetadataDao = object : MetadataDao {
        override suspend fun getValue(key: String): String? = null
        override fun observeAllMetadata() = flowOf(emptyList<MetadataEntity>())
    }

    private val repository = DictionaryRepository(mockEntryDao, mockSearchDao, mockMetadataDao, MiskitoTextNormalizer(), SearchRanker())

    @Test
    fun search_returnsRankedResults() = runBlocking {
        val results = repository.search("test")
        assertEquals(1, results.size)
        assertEquals("test", results[0].headword)
    }

    @Test
    fun getEntryDetail_returnsDetail() = runBlocking {
        val detail = repository.getEntryDetail(1L)
        assertEquals(1L, detail?.entry?.id)
        assertEquals("test", detail?.entry?.headword)
    }

    @Test
    fun search_normalizesQuery_andRanksExactMatchFirst() = runBlocking {
        // user enters "ba", mock returns two records, "aba" where translation is "baka", and "bâ" where headword is "bâ".
        // The exact normalized headword should score higher than string in translation.
        val results = repository.search("ba")
        assertEquals(2, results.size)
        assertEquals("bâ", results[0].headword)
        assertEquals("aba", results[1].headword)
    }
}
