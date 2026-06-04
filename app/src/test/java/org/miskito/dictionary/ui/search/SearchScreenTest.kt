package org.miskito.dictionary.ui.search

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.miskito.dictionary.domain.model.SearchFilter

@RunWith(RobolectricTestRunner::class)
class SearchScreenTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun testInitialState_showsPlaceholder() {
        composeTestRule.setContent {
            // We pass an empty stateless version or minimal state to avoid ViewModel dependencies.
            SearchContent(
                query = "",
                onQueryChange = {},
                filter = SearchFilter.ALL,
                onFilterSelected = {},
                uiState = org.miskito.dictionary.viewmodel.SearchUiState.Initial,
                onNavigateToEntry = {}
            )
        }

        composeTestRule.onNodeWithText("Buscar en miskito, español o inglés").assertIsDisplayed()
    }
}
