package org.miskito.dictionary.ui.search

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.List
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import org.miskito.dictionary.domain.model.SearchResult

import androidx.compose.material.icons.automirrored.filled.List

@Composable
fun SearchResultItem(
    result: SearchResult,
    onClick: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clickable { onClick(result.entryId) },
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = result.headword,
                    style = MaterialTheme.typography.titleLarge,
                    color = MaterialTheme.colorScheme.primary,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f)
                )
                
                if (!result.partOfSpeech.isNullOrBlank()) {
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = result.partOfSpeech,
                        style = MaterialTheme.typography.labelMedium,
                        color = MaterialTheme.colorScheme.secondary
                    )
                }
            }

            if (!result.spanishTranslation.isNullOrBlank()) {
                Text(
                    text = result.spanishTranslation,
                    style = MaterialTheme.typography.bodyLarge,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )
            }

            if (!result.variantLabel.isNullOrBlank()) {
                Text(
                    text = "Variante: ${result.variantLabel}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            if (result.hasExamples || result.hasNotes) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    if (result.hasExamples) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.AutoMirrored.Filled.List,
                                contentDescription = "Tiene ejemplos",
                                modifier = Modifier.size(16.dp),
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Text(
                                text = "Ejemplos",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.primary
                            )
                        }
                    }
                    if (result.hasNotes) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                imageVector = Icons.Default.Info,
                                contentDescription = "Tiene notas",
                                modifier = Modifier.size(16.dp),
                                tint = MaterialTheme.colorScheme.secondary
                            )
                            Text(
                                text = "Notas",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.secondary
                            )
                        }
                    }
                }
            }
        }
    }
}
