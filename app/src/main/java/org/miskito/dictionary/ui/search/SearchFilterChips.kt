package org.miskito.dictionary.ui.search

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import org.miskito.dictionary.domain.model.SearchFilter

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SearchFilterChips(
    selectedFilter: SearchFilter,
    onFilterSelected: (SearchFilter) -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 8.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        SearchFilter.values().forEach { filter ->
            FilterChip(
                selected = selectedFilter == filter,
                onClick = { onFilterSelected(filter) },
                label = {
                    Text(
                        text = when (filter) {
                            SearchFilter.ALL -> "Todo"
                            SearchFilter.MISKITO -> "Miskito"
                            SearchFilter.SPANISH -> "Español"
                            SearchFilter.ENGLISH -> "Inglés"
                        }
                    )
                }
            )
        }
    }
}
