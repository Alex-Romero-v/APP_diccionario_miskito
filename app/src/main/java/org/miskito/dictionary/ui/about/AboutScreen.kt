package org.miskito.dictionary.ui.about

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import org.miskito.dictionary.ui.common.AppScaffold

@Composable
fun AboutScreen() {
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
                text = "Diccionario Miskito - Español - Inglés",
                style = MaterialTheme.typography.headlineMedium,
                color = MaterialTheme.colorScheme.primary
            )

            Text(
                text = "Breve historia del rescate",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = "Este proyecto de digitalización y rescate lingüístico busca preservar y revitalizar el idioma miskito, facilitando su aprendizaje y consulta mediante herramientas tecnológicas modernas. Históricamente, el idioma miskito ha sido transmitido de manera oral y la documentación ha sido limitada. Esta aplicación consolida los esfuerzos de diferentes comunidades, lingüistas y académicos, ofreciendo una fuente de consulta estructurada y accesible para las nuevas generaciones.\n\nBasado en el C.R. Heath Miskito-English Dictionary y validación lingüística de campo.",
                style = MaterialTheme.typography.bodyLarge
            )

            Text(
                text = "Agradecimientos metodológicos",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )

            Text(
                text = "Agradecemos a todos los investigadores, lingüistas, comunidades miskitas, y contribuidores de código abierto que han hecho posible este proyecto. Su esfuerzo en la validación, recopilación y preservación son invaluables.",
                style = MaterialTheme.typography.bodyLarge
            )
        }
    }
}
