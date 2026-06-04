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
import org.miskito.dictionary.domain.model.EntryReference
import org.miskito.dictionary.ui.common.SectionTitle

@Composable
fun ReferenceSection(
    references: List<EntryReference>,
    modifier: Modifier = Modifier
) {
    if (references.isEmpty()) return

    Column(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        SectionTitle(title = "Referencias cruzadas")
        references.forEach { ref ->
            Text(
                text = "→ ${ref.rawReferenceText}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.primary
            )
        }
    }
}
