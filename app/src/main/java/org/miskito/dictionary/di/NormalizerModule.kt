package org.miskito.dictionary.di

import dagger.Binds
import dagger.Module
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import org.miskito.dictionary.domain.normalizer.MiskitoTextNormalizer
import org.miskito.dictionary.domain.normalizer.TextNormalizer
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class NormalizerModule {

    @Binds
    @Singleton
    abstract fun bindTextNormalizer(
        miskitoTextNormalizer: MiskitoTextNormalizer
    ): TextNormalizer
}
