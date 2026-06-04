package org.miskito.dictionary.data.repository

import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import org.miskito.dictionary.data.local.dao.PhraseDao
import org.miskito.dictionary.domain.model.Phrase
import org.miskito.dictionary.domain.model.PhraseCategory

open class PhrasesRepository(
    private val phraseDao: PhraseDao
) {
    fun observePhrases(): Flow<List<Phrase>> {
        return phraseDao.observeAllPhrases().map { list -> list.map { it.toDomainModel() } }
    }

    suspend fun getPhrasesByCategory(category: PhraseCategory): List<Phrase> {
        return phraseDao.getPhrasesByCategory(category.name).map { it.toDomainModel() }
    }

    suspend fun observePhrasesByCategory(category: PhraseCategory): Flow<List<Phrase>> {
        return observePhrases().map { phrases -> phrases.filter { it.category == category } }
    }

    open fun hasReliablePhrases(): Boolean {
        return true
    }

    fun searchPhrases(query: String): Flow<List<Phrase>> {
        val lowerQuery = query.lowercase()
        return observePhrases().map { phrases ->
            phrases.filter { 
                it.phraseText.lowercase().contains(lowerQuery) || 
                (it.spanishText?.lowercase()?.contains(lowerQuery) == true) || 
                (it.englishText?.lowercase()?.contains(lowerQuery) == true)
            }
        }
    }
}
