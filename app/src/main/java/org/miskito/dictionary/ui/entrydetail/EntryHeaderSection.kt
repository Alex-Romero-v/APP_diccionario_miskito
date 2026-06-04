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
import org.miskito.dictionary.domain.model.DictionaryEntry
import org.miskito.dictionary.domain.model.ExtractionConfidence

@Composable
fun EntryHeaderSection(
    entry: DictionaryEntry,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            text = entry.headword,
            style = MaterialTheme.typography.displaySmall,
            color = MaterialTheme.colorScheme.primary
        )
        if (!entry.partOfSpeech.isNullOrBlank()) {
            Text(
                text = entry.partOfSpeech,
                style = MaterialTheme.typography.titleMedium,
                fontStyle = FontStyle.Italic,
                color = MaterialTheme.colorScheme.secondary
            )
        }
        if (entry.extractionConfidence == ExtractionConfidence.LOW) {
            Text(
                text = "Entrada pendiente de revisión estructural.",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.error
            )
        }
    }
}
