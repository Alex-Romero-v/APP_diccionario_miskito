package org.miskito.dictionary.data.local.dao

import androidx.room.Dao
import androidx.room.Query
import org.miskito.dictionary.data.local.relation.SearchResultProjection

@Dao
interface SearchDao {
    @Query("""
        SELECT e.id, e.headword, e.normalized_headword, e.sort_key, e.part_of_speech, 
               t.spanish_text as spanish_translation, e.has_examples, e.has_notes, e.has_variants,
               s.variants_text as fts_variants_text, s.spanish_text as fts_spanish_text,
               s.english_text as fts_english_text, s.examples_text as fts_examples_text, s.notes_text as fts_notes_text
        FROM entries e
        LEFT JOIN translations t ON e.id = t.entry_id AND t.translation_order = 1
        JOIN search_index s ON e.id = s.entry_id
        WHERE search_index MATCH :query
        LIMIT :limit
    """)
    suspend fun searchAll(query: String, limit: Int): List<SearchResultProjection>
}
