package org.miskito.dictionary.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

val defaultTypography = Typography()

fun getScaledTypography(scaleFactor: Float): Typography {
    return Typography(
        displayLarge = defaultTypography.displayLarge.copy(fontSize = defaultTypography.displayLarge.fontSize.scaleBy(scaleFactor)),
        displayMedium = defaultTypography.displayMedium.copy(fontSize = defaultTypography.displayMedium.fontSize.scaleBy(scaleFactor)),
        displaySmall = defaultTypography.displaySmall.copy(fontSize = defaultTypography.displaySmall.fontSize.scaleBy(scaleFactor)),
        headlineLarge = defaultTypography.headlineLarge.copy(fontSize = defaultTypography.headlineLarge.fontSize.scaleBy(scaleFactor)),
        headlineMedium = defaultTypography.headlineMedium.copy(fontSize = defaultTypography.headlineMedium.fontSize.scaleBy(scaleFactor)),
        headlineSmall = defaultTypography.headlineSmall.copy(fontSize = defaultTypography.headlineSmall.fontSize.scaleBy(scaleFactor)),
        titleLarge = defaultTypography.titleLarge.copy(fontSize = defaultTypography.titleLarge.fontSize.scaleBy(scaleFactor)),
        titleMedium = defaultTypography.titleMedium.copy(fontSize = defaultTypography.titleMedium.fontSize.scaleBy(scaleFactor)),
        titleSmall = defaultTypography.titleSmall.copy(fontSize = defaultTypography.titleSmall.fontSize.scaleBy(scaleFactor)),
        bodyLarge = defaultTypography.bodyLarge.copy(fontSize = defaultTypography.bodyLarge.fontSize.scaleBy(scaleFactor)),
        bodyMedium = defaultTypography.bodyMedium.copy(fontSize = defaultTypography.bodyMedium.fontSize.scaleBy(scaleFactor)),
        bodySmall = defaultTypography.bodySmall.copy(fontSize = defaultTypography.bodySmall.fontSize.scaleBy(scaleFactor)),
        labelLarge = defaultTypography.labelLarge.copy(fontSize = defaultTypography.labelLarge.fontSize.scaleBy(scaleFactor)),
        labelMedium = defaultTypography.labelMedium.copy(fontSize = defaultTypography.labelMedium.fontSize.scaleBy(scaleFactor)),
        labelSmall = defaultTypography.labelSmall.copy(fontSize = defaultTypography.labelSmall.fontSize.scaleBy(scaleFactor))
    )
}
