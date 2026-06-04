package org.miskito.dictionary.ui.entrydetail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.unit.dp
import org.miskito.dictionary.domain.model.Example
import org.miskito.dictionary.ui.common.SectionTitle

@Composable
fun ExampleSection(
    examples: List<Example>,
    showEnglish: Boolean,
    modifier: Modifier = Modifier
) {
    if (examples.isEmpty()) return

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        SectionTitle(title = "Ejemplos")
        examples.forEach { example ->
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = example.miskitoText,
                    style = MaterialTheme.typography.bodyLarge,
                    fontStyle = FontStyle.Italic
                )
                if (!example.spanishText.isNullOrBlank()) {
                    Text(
                        text = "Español: ${example.spanishText}",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
                if (showEnglish && !example.englishText.isNullOrBlank()) {
                    Text(
                        text = "Inglés: ${example.englishText}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                if (example.isLiteralTranslation) {
                    Text(
                        text = "(Ejemplo literal)",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.secondary
                    )
                }
                if (!example.sourceDetail.isNullOrBlank() || !example.sourceCode.isNullOrBlank()) {
                    val parts = listOfNotNull(example.sourceCode, example.sourceDetail)
                    Text(
                        text = "Fuente: ${parts.joinToString(" - ")}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}
