package org.miskito.dictionary.data.local.dao

import androidx.room.Dao
import androidx.room.Query
import org.miskito.dictionary.data.local.relation.SearchResultProjection

@Dao
interface SearchDao {
    @Query("""
        SELECT e.id, e.headword, e.normalized_headword, e.sort_key, e.part_of_speech, 
               t.spanish_text as spanish_translation, e.has_examples, e.has_notes, e.has_variants
        FROM entries e
        LEFT JOIN translations t ON e.id = t.entry_id AND t.translation_order = 1
        JOIN search_index s ON e.id = s.entry_id
        WHERE search_index MATCH :normalizedQuery OR search_index MATCH :rawQuery
        LIMIT :limit
    """)
    suspend fun searchAll(normalizedQuery: String, rawQuery: String, limit: Int): List<SearchResultProjection>

    @Query("""
        SELECT e.id, e.headword, e.normalized_headword, e.sort_key, e.part_of_speech, 
               t.spanish_text as spanish_translation, e.has_examples, e.has_notes, e.has_variants
        FROM entries e
        LEFT JOIN translations t ON e.id = t.entry_id AND t.translation_order = 1
        JOIN search_index s ON e.id = s.entry_id
        WHERE search_index MATCH :normalizedQuery OR search_index MATCH :rawQuery
        LIMIT :limit
    """)
    suspend fun searchMiskito(normalizedQuery: String, rawQuery: String, limit: Int): List<SearchResultProjection>

    @Query("""
        SELECT e.id, e.headword, e.normalized_headword, e.sort_key, e.part_of_speech, 
               t.spanish_text as spanish_translation, e.has_examples, e.has_notes, e.has_variants
        FROM entries e
        LEFT JOIN translations t ON e.id = t.entry_id AND t.translation_order = 1
        JOIN search_index s ON e.id = s.entry_id
        WHERE search_index MATCH :normalizedQuery OR search_index MATCH :rawQuery
        LIMIT :limit
    """)
    suspend fun searchSpanish(normalizedQuery: String, rawQuery: String, limit: Int): List<SearchResultProjection>

    @Query("""
        SELECT e.id, e.headword, e.normalized_headword, e.sort_key, e.part_of_speech, 
               t.spanish_text as spanish_translation, e.has_examples, e.has_notes, e.has_variants
        FROM entries e
        LEFT JOIN translations t ON e.id = t.entry_id AND t.translation_order = 1
        JOIN search_index s ON e.id = s.entry_id
        WHERE search_index MATCH :normalizedQuery OR search_index MATCH :rawQuery
        LIMIT :limit
    """)
    suspend fun searchEnglish(normalizedQuery: String, rawQuery: String, limit: Int): List<SearchResultProjection>
}
