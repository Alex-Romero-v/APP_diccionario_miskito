package org.miskito.dictionary.ui.phrases

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.miskito.dictionary.ui.common.AppScaffold
import org.miskito.dictionary.ui.common.EmptyState
import org.miskito.dictionary.ui.common.LoadingState
import org.miskito.dictionary.viewmodel.PhrasesUiState
import org.miskito.dictionary.viewmodel.PhrasesViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PhrasesScreen(
    viewModel: PhrasesViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()

    AppScaffold(title = "Frases") { paddingValues ->
        when (val state = uiState) {
            is PhrasesUiState.Loading -> {
                LoadingState(modifier = Modifier.padding(paddingValues))
            }
            is PhrasesUiState.Unavailable -> {
                EmptyState(
                    message = "El módulo de frases no está disponible en esta versión.",
                    modifier = Modifier.padding(paddingValues)
                )
            }
            is PhrasesUiState.Success -> {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                ) {
                    OutlinedTextField(
                        value = state.query,
                        onValueChange = viewModel::setQuery,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        placeholder = { Text("Buscar frase...") },
                        singleLine = true
                    )
                    
                    CategoryFilter(
                        selectedCategory = state.currentCategory,
                        onCategorySelected = viewModel::setCategory
                    )
                    
                    if (state.phrases.isEmpty()) {
                        EmptyState(
                            message = "No se encontraron frases.",
                            modifier = Modifier.weight(1f)
                        )
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(vertical = 8.dp)
                        ) {
                            items(state.phrases, key = { it.id }) { phrase ->
                                PhraseItem(
                                    phrase = phrase,
                                    onClick = { /* Could copy to clipboard, or expand */ }
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
