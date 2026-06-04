package org.miskito.dictionary.ui.phrases

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import org.miskito.dictionary.domain.model.PhraseCategory

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CategoryFilter(
    selectedCategory: PhraseCategory?,
    onCategorySelected: (PhraseCategory?) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        FilterChip(
            selected = selectedCategory == null,
            onClick = { onCategorySelected(null) },
            label = { Text("Todas") }
        )
        PhraseCategory.values().forEach { category ->
            FilterChip(
                selected = selectedCategory == category,
                onClick = { onCategorySelected(category) },
                label = { Text(category.name) }
            )
        }
    }
}
