package org.miskito.dictionary.ui.search

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import org.miskito.dictionary.ui.common.LoadingState

@Composable
fun SearchLoadingIndicator(
    modifier: Modifier = Modifier
) {
    LoadingState(modifier = modifier)
}
