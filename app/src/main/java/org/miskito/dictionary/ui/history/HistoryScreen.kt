package org.miskito.dictionary.ui.history

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.miskito.dictionary.ui.common.AppScaffold
import org.miskito.dictionary.ui.common.EmptyState
import org.miskito.dictionary.ui.common.LoadingState
import org.miskito.dictionary.viewmodel.HistoryUiState
import org.miskito.dictionary.viewmodel.HistoryViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(
    onNavigateToEntry: (Long) -> Unit,
    viewModel: HistoryViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    AppScaffold(
        title = "Historial",
        actions = {
            if (uiState is HistoryUiState.Success) {
                IconButton(onClick = viewModel::clearHistory) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Borrar historial"
                    )
                }
            }
        }
    ) { paddingValues ->
        when (val state = uiState) {
            is HistoryUiState.Loading -> {
                LoadingState(modifier = Modifier.padding(paddingValues))
            }
            is HistoryUiState.Empty -> {
                EmptyState(
                    message = "Aún no ha consultado palabras.",
                    modifier = Modifier.padding(paddingValues)
                )
            }
            is HistoryUiState.Success -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                ) {
                    items(state.history, key = { it.entryId }) { historyEntry ->
                        HistoryItem(
                            history = historyEntry,
                            onClick = onNavigateToEntry
                        )
                    }
                }
            }
        }
    }
}
