package org.miskito.dictionary.data.repository

import org.junit.Assert.assertEquals
import org.junit.Test
import org.miskito.dictionary.data.local.entity.EntryEntity
import org.miskito.dictionary.data.local.entity.MetadataEntity

class MetadataMapperTest {

    @Test
    fun metadata_mapsToDomainCorrectly() {
        val entities = listOf(
            MetadataEntity("dictionaryName", "Test Dictionary"),
            MetadataEntity("databaseVersion", "1.5")
        )
        
        val domain = entities.toDomainModel()
        
        assertEquals("Test Dictionary", domain.dictionaryName)
        assertEquals("1.5", domain.databaseVersion)
        assertEquals("Unknown", domain.dictionarySource)
    }
    
    @Test
    fun entry_mapsToDomainCorrectly() {
        val entity = EntryEntity(
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
        
        val domain = entity.toDomainModel()
        
        assertEquals(1L, domain.id)
        assertEquals("test", domain.headword)
    }
}
