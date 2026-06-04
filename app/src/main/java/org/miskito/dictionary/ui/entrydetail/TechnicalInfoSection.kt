package org.miskito.dictionary.ui.entrydetail

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.miskito.dictionary.domain.model.DictionaryEntry

@Composable
fun TechnicalInfoSection(
    entry: DictionaryEntry,
    modifier: Modifier = Modifier
) {
    if (entry.sourcePage == null) return

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(16.dp)
    ) {
        Text(
            text = "Página de origen: ${entry.sourcePage}",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}
