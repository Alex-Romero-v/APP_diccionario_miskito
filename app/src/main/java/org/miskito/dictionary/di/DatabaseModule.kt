package org.miskito.dictionary.di

import android.content.Context
import androidx.room.Room
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import org.miskito.dictionary.data.local.dao.*
import org.miskito.dictionary.data.local.database.DictionaryDatabase
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDictionaryDatabase(@ApplicationContext context: Context): DictionaryDatabase {
        return Room.databaseBuilder(
            context,
            DictionaryDatabase::class.java,
            "dictionary.db"
        )
        .createFromAsset("dictionary.db")
        .build()
    }

    @Provides
    fun provideEntryDao(database: DictionaryDatabase): EntryDao = database.entryDao()

    @Provides
    fun provideSearchDao(database: DictionaryDatabase): SearchDao = database.searchDao()

    @Provides
    fun provideMetadataDao(database: DictionaryDatabase): MetadataDao = database.metadataDao()

    @Provides
    fun provideFavoriteDao(database: DictionaryDatabase): FavoriteDao = database.favoriteDao()

    @Provides
    fun provideHistoryDao(database: DictionaryDatabase): HistoryDao = database.historyDao()

    @Provides
    fun providePhraseDao(database: DictionaryDatabase): PhraseDao = database.phraseDao()
}
