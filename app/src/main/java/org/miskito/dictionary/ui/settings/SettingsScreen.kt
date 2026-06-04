package org.miskito.dictionary.ui.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.miskito.dictionary.domain.model.EnglishVisibility
import org.miskito.dictionary.domain.model.FontSizePreference
import org.miskito.dictionary.domain.model.ThemePreference
import org.miskito.dictionary.ui.common.AppScaffold
import org.miskito.dictionary.viewmodel.SettingsViewModel

@Composable
fun SettingsScreen(
    viewModel: SettingsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    var showFontSizeDialog by remember { mutableStateOf(false) }
    var showThemeDialog by remember { mutableStateOf(false) }
    var showEnglishDialog by remember { mutableStateOf(false) }

    AppScaffold(title = "Ajustes") { paddingValues ->
        Column(modifier = Modifier.padding(paddingValues)) {
            SettingItem(
                title = "Tamaño de letra",
                subtitle = when (uiState.fontSize) {
                    FontSizePreference.SMALL -> "Pequeña"
                    FontSizePreference.NORMAL -> "Normal"
                    FontSizePreference.LARGE -> "Grande"
                    FontSizePreference.EXTRA_LARGE -> "Extra Grande"
                },
                onClick = { showFontSizeDialog = true }
            )
            
            SettingItem(
                title = "Tema",
                subtitle = when (uiState.theme) {
                    ThemePreference.LIGHT -> "Claro"
                    ThemePreference.DARK -> "Oscuro"
                    ThemePreference.SYSTEM -> "Sistema"
                },
                onClick = { showThemeDialog = true }
            )
            
            SettingItem(
                title = "Mostrar inglés",
                subtitle = when (uiState.englishVisibility) {
                    EnglishVisibility.ALWAYS -> "Siempre"
                    EnglishVisibility.DETAIL_ONLY -> "Solo detalle"
                    EnglishVisibility.HIDDEN -> "Oculto"
                },
                onClick = { showEnglishDialog = true }
            )
            
            SettingItem(
                title = "Borrar historial de búsqueda",
                subtitle = "Eliminar todas las búsquedas guardadas",
                onClick = viewModel::clearHistory
            )
            
            Divider(modifier = Modifier.padding(vertical = 8.dp))
            
            SettingItem(
                title = "Versión de la aplicación",
                subtitle = uiState.appVersion,
                onClick = {}
            )
            
            SettingItem(
                title = "Versión del diccionario",
                subtitle = uiState.dbVersion,
                onClick = {}
            )
        }
    }
    
    if (showFontSizeDialog) {
        OptionsDialog(
            title = "Tamaño de letra",
            options = listOf(
                "Pequeña" to FontSizePreference.SMALL,
                "Normal" to FontSizePreference.NORMAL,
                "Grande" to FontSizePreference.LARGE,
                "Extra Grande" to FontSizePreference.EXTRA_LARGE
            ),
            selectedOption = uiState.fontSize,
            onOptionSelected = { viewModel.changeFontSize(it) },
            onDismiss = { showFontSizeDialog = false }
        )
    }

    if (showThemeDialog) {
        OptionsDialog(
            title = "Tema",
            options = listOf(
                "Claro" to ThemePreference.LIGHT,
                "Oscuro" to ThemePreference.DARK,
                "Sistema" to ThemePreference.SYSTEM
            ),
            selectedOption = uiState.theme,
            onOptionSelected = { viewModel.toggleTheme(it) },
            onDismiss = { showThemeDialog = false }
        )
    }

    if (showEnglishDialog) {
        OptionsDialog(
            title = "Mostrar inglés",
            options = listOf(
                "Siempre" to EnglishVisibility.ALWAYS,
                "Solo detalle" to EnglishVisibility.DETAIL_ONLY,
                "Oculto" to EnglishVisibility.HIDDEN
            ),
            selectedOption = uiState.englishVisibility,
            onOptionSelected = { viewModel.toggleEnglishValidations(it) },
            onDismiss = { showEnglishDialog = false }
        )
    }
}

@Composable
private fun <T> OptionsDialog(
    title: String,
    options: List<Pair<String, T>>,
    selectedOption: T,
    onOptionSelected: (T) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(text = title) },
        text = {
            Column {
                options.forEach { (label, value) ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable {
                                onOptionSelected(value)
                                onDismiss()
                            }
                            .padding(vertical = 12.dp)
                    ) {
                        RadioButton(
                            selected = value == selectedOption,
                            onClick = {
                                onOptionSelected(value)
                                onDismiss()
                            }
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(text = label)
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancelar")
            }
        }
    )
}
