package org.miskito.dictionary.ui.favorites

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.miskito.dictionary.domain.model.FavoriteEntry

@Composable
fun FavoriteItem(
    favorite: FavoriteEntry,
    onClick: (Long) -> Unit,
    onRemove: (Long) -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp)
            .clickable { onClick(favorite.entryId) },
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
                    text = "Entrada #${favorite.entryId}",
                    style = MaterialTheme.typography.titleMedium,
                    color = MaterialTheme.colorScheme.primary
                )
                Text(
                    text = "Añadido: ${favorite.createdAt.take(10)}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
            IconButton(onClick = { onRemove(favorite.entryId) }) {
                Icon(
                    imageVector = Icons.Default.Delete,
                    contentDescription = "Quitar favorito",
                    tint = MaterialTheme.colorScheme.error
                )
            }
        }
    }
}
