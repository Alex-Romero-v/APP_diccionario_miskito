package org.miskito.dictionary.ui.theme

import androidx.compose.ui.unit.TextUnit
import androidx.compose.ui.unit.sp
import org.miskito.dictionary.domain.model.FontSizePreference

fun FontSizePreference.getScaleFactor(): Float {
    return when (this) {
        FontSizePreference.SMALL -> 0.90f
        FontSizePreference.NORMAL -> 1.00f
        FontSizePreference.LARGE -> 1.15f
        FontSizePreference.EXTRA_LARGE -> 1.30f
    }
}

fun TextUnit.scaleBy(factor: Float): TextUnit {
    return if (this.isSp) {
        (this.value * factor).sp
    } else {
        this
    }
}
