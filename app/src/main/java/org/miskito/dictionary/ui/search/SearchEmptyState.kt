package org.miskito.dictionary.ui.search

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import org.miskito.dictionary.ui.common.EmptyState

@Composable
fun SearchEmptyState(
    isInitial: Boolean = false,
    isTooShort: Boolean = false,
    modifier: Modifier = Modifier
) {
    val message = when {
        isInitial -> "Busca palabras en el diccionario."
        isTooShort -> "Ingresa al menos 2 caracteres."
        else -> "No se encontró esta palabra. Pruebe escribirla sin marcas, revise la ortografía o busque solo una parte de la palabra."
    }
    
    EmptyState(
        message = message,
        modifier = modifier
    )
}
