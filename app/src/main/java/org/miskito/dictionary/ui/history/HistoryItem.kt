package org.miskito.dictionary.ui.history

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.miskito.dictionary.domain.model.HistoryEntry

@Composable
fun HistoryItem(
    history: HistoryEntry,
    onClick: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clickable { onClick(history.entryId) },
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = "Entrada #${history.entryId}",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "Consultado: ${history.lastOpenedAt.take(16).replace("T", " ")}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            Text(
                text = "Visitas: ${history.openCount}",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.secondary
            )
        }
    }
}
