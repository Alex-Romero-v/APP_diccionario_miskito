package org.miskito.dictionary

import org.junit.Test
import java.io.File

class ManifestPermissionTest {
    @Test
    fun manifestHasNoUnnecessaryPermissions() {
        val manifestFile = File("src/main/AndroidManifest.xml")
        val content = manifestFile.readText()
        
        val forbiddenPermissions = listOf(
            "INTERNET", "CAMERA", "RECORD_AUDIO", "ACCESS_FINE_LOCATION",
            "ACCESS_COARSE_LOCATION", "READ_CONTACTS", "SEND_SMS", "CALL_PHONE",
            "READ_EXTERNAL_STORAGE", "WRITE_EXTERNAL_STORAGE", "MANAGE_EXTERNAL_STORAGE"
        )
        
        for (permission in forbiddenPermissions) {
            assert(!content.contains("android.permission.$permission")) {
                "Manifest contains forbidden permission: $permission"
            }
        }
    }
}
