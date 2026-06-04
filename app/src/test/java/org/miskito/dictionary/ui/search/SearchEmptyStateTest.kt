package org.miskito.dictionary.ui.search

import androidx.compose.ui.test.*
import androidx.compose.ui.test.junit4.createComposeRule
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class SearchEmptyStateTest {

    @get:Rule
    val composeTestRule = createComposeRule()

    @Test
    fun testEmptyState_showsMessage() {
        composeTestRule.setContent {
            SearchEmptyState()
        }

        composeTestRule.onNodeWithText("No se encontró esta palabra. Pruebe escribirla sin marcas, revise la ortografía o busque solo una parte de la palabra.").assertIsDisplayed()
    }
}
