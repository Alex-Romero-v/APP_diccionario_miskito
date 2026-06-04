package org.miskito.dictionary.ui.favorites

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.miskito.dictionary.ui.common.AppScaffold
import org.miskito.dictionary.ui.common.EmptyState
import org.miskito.dictionary.ui.common.LoadingState
import org.miskito.dictionary.viewmodel.FavoritesUiState
import org.miskito.dictionary.viewmodel.FavoritesViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FavoritesScreen(
    onNavigateToEntry: (Long) -> Unit,
    viewModel: FavoritesViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    AppScaffold(
        title = "Favoritos"
    ) { paddingValues ->
        when (val state = uiState) {
            is FavoritesUiState.Loading -> {
                LoadingState(modifier = Modifier.padding(paddingValues))
            }
            is FavoritesUiState.Empty -> {
                EmptyState(
                    message = "Aún no ha guardado palabras favoritas.",
                    modifier = Modifier.padding(paddingValues)
                )
            }
            is FavoritesUiState.Success -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                ) {
                    items(state.favorites, key = { it.entryId }) { favorite ->
                        FavoriteItem(
                            favorite = favorite,
                            onClick = onNavigateToEntry,
                            onRemove = viewModel::removeFavorite
                        )
                    }
                }
            }
        }
    }
}
