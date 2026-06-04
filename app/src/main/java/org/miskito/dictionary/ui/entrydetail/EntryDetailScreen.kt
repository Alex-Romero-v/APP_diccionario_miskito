package org.miskito.dictionary.ui.entrydetail

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.FavoriteBorder
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.miskito.dictionary.domain.model.EnglishVisibility
import org.miskito.dictionary.ui.common.AppScaffold
import org.miskito.dictionary.ui.common.ErrorState
import org.miskito.dictionary.ui.common.LoadingState
import org.miskito.dictionary.viewmodel.EntryDetailUiState
import org.miskito.dictionary.viewmodel.EntryDetailViewModel
import org.miskito.dictionary.viewmodel.SettingsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EntryDetailScreen(
    entryId: Long,
    onNavigateBack: () -> Unit,
    viewModel: EntryDetailViewModel = hiltViewModel(),
    settingsViewModel: SettingsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val settingsState by settingsViewModel.uiState.collectAsStateWithLifecycle()

    LaunchedEffect(entryId) {
        viewModel.loadEntry(entryId)
    }

    val showEnglish = settingsState.englishVisibility == EnglishVisibility.ALWAYS ||
            settingsState.englishVisibility == EnglishVisibility.DETAIL_ONLY

    AppScaffold(
        title = "Detalle",
        navigationIcon = {
            IconButton(onClick = onNavigateBack) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Volver"
                )
            }
        },
        floatingActionButton = {
            if (uiState is EntryDetailUiState.Success) {
                val successState = uiState as EntryDetailUiState.Success
                FloatingActionButton(
                    onClick = { viewModel.toggleFavorite(entryId) }
                ) {
                    Icon(
                        imageVector = if (successState.isFavorite) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                        contentDescription = "Favorito"
                    )
                }
            }
        }
    ) { paddingValues ->
        when (val state = uiState) {
            is EntryDetailUiState.Loading -> LoadingState(modifier = Modifier.padding(paddingValues))
            is EntryDetailUiState.NotFound -> ErrorState(
                errorMessage = "Entrada no encontrada",
                modifier = Modifier.padding(paddingValues)
            )
            is EntryDetailUiState.Error -> ErrorState(
                errorMessage = state.message,
                onRetry = { viewModel.loadEntry(entryId) },
                modifier = Modifier.padding(paddingValues)
            )
            is EntryDetailUiState.Success -> {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                ) {
                    item {
                        EntryHeaderSection(entry = state.detail.entry)
                    }
                    item {
                        TranslationSection(
                            translations = state.detail.translations,
                            showEnglish = showEnglish
                        )
                    }
                    item {
                        VariantSection(variants = state.detail.variants)
                    }
                    item {
                        ExampleSection(
                            examples = state.detail.examples,
                            showEnglish = showEnglish
                        )
                    }
                    item {
                        NoteSection(notes = state.detail.notes)
                    }
                    item {
                        ReferenceSection(references = state.detail.references)
                    }
                    item {
                        TechnicalInfoSection(entry = state.detail.entry)
                    }
                }
            }
        }
    }
}
