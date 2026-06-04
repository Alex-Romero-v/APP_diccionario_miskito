package org.miskito.dictionary.ui.phrases

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontStyle
import androidx.compose.ui.unit.dp
import org.miskito.dictionary.domain.model.Phrase

@Composable
fun PhraseItem(
    phrase: Phrase,
    onClick: (Phrase) -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clickable { onClick(phrase) },
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            Text(
                text = phrase.phraseText,
                style = MaterialTheme.typography.titleMedium,
                fontStyle = FontStyle.Italic,
                color = MaterialTheme.colorScheme.primary
            )
            if (!phrase.spanishText.isNullOrBlank()) {
                Text(
                    text = phrase.spanishText,
                    style = MaterialTheme.typography.bodyLarge
                )
            }
            if (!phrase.englishText.isNullOrBlank()) {
                Text(
                    text = phrase.englishText,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
