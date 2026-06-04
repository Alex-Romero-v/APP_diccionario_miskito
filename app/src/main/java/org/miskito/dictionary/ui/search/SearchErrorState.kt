package org.miskito.dictionary.ui.search

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import org.miskito.dictionary.ui.common.ErrorState

@Composable
fun SearchErrorState(
    message: String,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    ErrorState(
        errorMessage = "Ocurrió un error: $message",
        onRetry = onRetry,
        modifier = modifier
    )
}
