package org.miskito.dictionary.domain.model

sealed interface AppError {
    data object DatabaseUnavailable : AppError
    data object EntryNotFound : AppError
    data object SearchFailed : AppError
    data object PreferencesUnavailable : AppError
    data object PipelineValidationFailed : AppError
    data object Unknown : AppError
}
