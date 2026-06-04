package org.miskito.dictionary.ui.search

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.miskito.dictionary.domain.model.SearchFilter
import org.miskito.dictionary.ui.common.AppScaffold
import org.miskito.dictionary.viewmodel.SearchUiState
import org.miskito.dictionary.viewmodel.SearchViewModel

@Composable
fun SearchScreen(
    onNavigateToEntry: (Long) -> Unit,
    viewModel: SearchViewModel = hiltViewModel()
) {
    val query by viewModel.query.collectAsStateWithLifecycle()
    val filter by viewModel.filter.collectAsStateWithLifecycle()
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    SearchContent(
        query = query,
        filter = filter,
        uiState = uiState,
        onQueryChange = viewModel::setQuery,
        onFilterSelected = viewModel::setFilter,
        onNavigateToEntry = onNavigateToEntry
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchContent(
    query: String,
    filter: SearchFilter,
    uiState: SearchUiState,
    onQueryChange: (String) -> Unit,
    onFilterSelected: (SearchFilter) -> Unit,
    onNavigateToEntry: (Long) -> Unit
) {
    AppScaffold(
        title = "Diccionario Miskito"
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            OutlinedTextField(
                value = query,
                onValueChange = onQueryChange,
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                placeholder = { Text("Buscar en miskito, español o inglés") },
                singleLine = true
            )
            
            SearchFilterChips(
                selectedFilter = filter,
                onFilterSelected = onFilterSelected
            )
            
            Box(modifier = Modifier.weight(1f)) {
                when (val state = uiState) {
                    is SearchUiState.Initial -> SearchEmptyState(isInitial = true)
                    is SearchUiState.TooShort -> SearchEmptyState(isTooShort = true)
                    is SearchUiState.Loading -> SearchLoadingIndicator()
                    is SearchUiState.Empty -> SearchEmptyState()
                    is SearchUiState.Error -> SearchErrorState(message = state.message, onRetry = {})
                    is SearchUiState.Success -> {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(vertical = 8.dp)
                        ) {
                            items(state.results) { result ->
                                SearchResultItem(
                                    result = result,
                                    onClick = onNavigateToEntry
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
