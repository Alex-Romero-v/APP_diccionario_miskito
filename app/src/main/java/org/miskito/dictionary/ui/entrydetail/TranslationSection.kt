package org.miskito.dictionary.ui.entrydetail

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.miskito.dictionary.domain.model.Translation
import org.miskito.dictionary.ui.common.SectionTitle

@Composable
fun TranslationSection(
    translations: List<Translation>,
    showEnglish: Boolean,
    modifier: Modifier = Modifier
) {
    if (translations.isEmpty()) return

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        SectionTitle(title = "Traducciones")
        translations.forEach { translation ->
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                if (!translation.spanishText.isNullOrBlank()) {
                    Text(
                        text = "Español: ${translation.spanishText}",
                        style = MaterialTheme.typography.bodyLarge
                    )
                }
                if (showEnglish && !translation.englishText.isNullOrBlank()) {
                    Text(
                        text = "Inglés: ${translation.englishText}",
                        style = MaterialTheme.typography.bodyLarge,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                if (translation.isLiteral) {
                    Text(
                        text = "(Traducción literal)",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.secondary
                    )
                }
                if (!translation.note.isNullOrBlank()) {
                    Text(
                        text = "Nota: ${translation.note}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}
