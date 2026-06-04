package org.miskito.dictionary.data.local.database

import androidx.room.Database
import androidx.room.RoomDatabase
import org.miskito.dictionary.data.local.dao.*
import org.miskito.dictionary.data.local.entity.*
import org.miskito.dictionary.data.local.fts.SearchIndexFtsEntity

@Database(
    entities = [
        EntryEntity::class,
        TranslationEntity::class,
        VariantEntity::class,
        ExampleEntity::class,
        NoteEntity::class,
        ReferenceEntity::class,
        EntryReferenceEntity::class,
        FavoriteEntity::class,
        HistoryEntity::class,
        MetadataEntity::class,
        PhraseEntity::class,
        SearchIndexFtsEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class DictionaryDatabase : RoomDatabase() {
    abstract fun entryDao(): EntryDao
    abstract fun metadataDao(): MetadataDao
    abstract fun searchDao(): SearchDao
    abstract fun favoriteDao(): FavoriteDao
    abstract fun historyDao(): HistoryDao
    abstract fun phraseDao(): PhraseDao
}
