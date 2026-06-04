package org.miskito.dictionary.ui.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun SettingItem(
    title: String,
    subtitle: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(16.dp)
    ) {
        Text(text = title, style = MaterialTheme.typography.titleMedium)
        Text(text = subtitle, style = MaterialTheme.typography.bodyMedium, color = MaterialTheme.colorScheme.onSurfaceVariant)
    }
}
