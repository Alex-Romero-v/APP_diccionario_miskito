package org.miskito.dictionary.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import org.miskito.dictionary.data.local.dao.MetadataDao
import org.miskito.dictionary.domain.model.DictionaryMetadata

class MetadataRepository(
    private val metadataDao: MetadataDao
) {
    suspend fun getDictionaryName(): String {
        return metadataDao.getValue("dictionaryName") ?: "Miskito Dictionary"
    }

    suspend fun getDatabaseVersion(): String {
        return metadataDao.getValue("databaseVersion") ?: "1.0"
    }

    suspend fun getEntriesCount(): String {
        return metadataDao.getValue("entriesCount") ?: "0"
    }

    suspend fun getExamplesCount(): String {
        return metadataDao.getValue("examplesCount") ?: "0"
    }

    fun observeMetadata(): Flow<DictionaryMetadata> {
        return metadataDao.observeAllMetadata().map { it.toDomainModel() }
    }
}
