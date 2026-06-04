package org.miskito.dictionary.di

import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import org.miskito.dictionary.data.local.dao.*
import org.miskito.dictionary.data.preferences.UserPreferencesDataSource
import org.miskito.dictionary.data.repository.*
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object RepositoryModule {
    
    @Provides
    @Singleton
    fun provideDictionaryRepository(
        entryDao: EntryDao,
        searchDao: SearchDao,
        metadataDao: MetadataDao
    ): DictionaryRepository = DictionaryRepository(entryDao, searchDao, metadataDao)

    @Provides
    @Singleton
    fun provideFavoritesRepository(favoriteDao: FavoriteDao): FavoritesRepository = FavoritesRepository(favoriteDao)

    @Provides
    @Singleton
    fun provideHistoryRepository(historyDao: HistoryDao): HistoryRepository = HistoryRepository(historyDao)

    @Provides
    @Singleton
    fun providePhrasesRepository(phraseDao: PhraseDao): PhrasesRepository = PhrasesRepository(phraseDao)

    @Provides
    @Singleton
    fun provideMetadataRepository(metadataDao: MetadataDao): MetadataRepository = MetadataRepository(metadataDao)

    @Provides
    @Singleton
    fun provideSettingsRepository(dataSource: UserPreferencesDataSource): SettingsRepository = SettingsRepository(dataSource)
}
