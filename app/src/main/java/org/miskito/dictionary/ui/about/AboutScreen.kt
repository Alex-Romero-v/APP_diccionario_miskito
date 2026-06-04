package org.miskito.dictionary.ui.about

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import org.miskito.dictionary.ui.common.AppScaffold
import org.miskito.dictionary.viewmodel.AboutViewModel

@Composable
fun AboutScreen(viewModel: AboutViewModel = hiltViewModel()) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val metadata = state.metadata
    
    AppScaffold(title = "Acerca del diccionario") { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = metadata?.dictionaryName ?: "Diccionario Miskito - Español - Inglés",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.primary
            )

            Text(
                text = state.baseText,
                style = MaterialTheme.typography.bodyLarge
            )

            Text(
                text = "Aviso legal",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = state.licenseNotice,
                style = MaterialTheme.typography.bodyLarge
            )

            Text(
                text = "Estadísticas de la base de datos",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = "Versión de base de datos: ${metadata?.databaseVersion ?: "Desconocida"}",
                style = MaterialTheme.typography.bodyLarge
            )

            Text(
                text = "Número de entradas: ${metadata?.entriesCount ?: "0"}",
                style = MaterialTheme.typography.bodyLarge
            )
        }
    }
}
