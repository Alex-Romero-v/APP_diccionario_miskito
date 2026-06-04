package org.miskito.dictionary.quality

import org.junit.Assert.assertTrue
import org.junit.Test
import java.io.File

class ReleaseConfigurationTest {
    @Test
    fun testReleaseConfiguration_filesExist() {
        // Verifica que el asset base exista
        val dbFile = File("src/main/assets/dictionary.db")
        assertTrue("El asset 'dictionary.db' debe existir en src/main/assets", dbFile.exists())

        // Verifica que proguard-rules.pro exista
        val proguardFiles = File("proguard-rules.pro")
        assertTrue("El archivo 'proguard-rules.pro' debe existir en el directorio 'app'", proguardFiles.exists())
    }
}
