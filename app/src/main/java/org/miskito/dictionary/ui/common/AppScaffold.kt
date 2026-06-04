package org.miskito.dictionary.ui.common

import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Scaffold
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppScaffold(
    modifier: Modifier = Modifier,
    title: String? = null,
    navigationIcon: @Composable () -> Unit = {},
    actions: @Composable () -> Unit = {},
    floatingActionButton: @Composable () -> Unit = {},
    content: @Composable (PaddingValues) -> Unit
) {
    Scaffold(
        modifier = modifier,
        topBar = {
            if (title != null) {
                TopAppBar(
                    title = { Text(text = title) },
                    navigationIcon = navigationIcon,
                    actions = { actions() }
                )
            }
        },
        floatingActionButton = floatingActionButton
    ) { paddingValues ->
        content(paddingValues)
    }
}
