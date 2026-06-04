package org.miskito.dictionary.quality

import org.junit.Assert.assertFalse
import org.junit.Test
import java.io.File

class ManifestPermissionTest {
    @Test
    fun testManifest_doesNotContainForbiddenPermissions() {
        val manifestFile = File("src/main/AndroidManifest.xml")
        val content = manifestFile.readText()
        
        val forbiddenPermissions = listOf(
            "android.permission.INTERNET",
            "android.permission.CAMERA",
            "android.permission.RECORD_AUDIO",
            "android.permission.ACCESS_FINE_LOCATION",
            "android.permission.ACCESS_COARSE_LOCATION",
            "android.permission.READ_CONTACTS",
            "android.permission.WRITE_CONTACTS",
            "android.permission.SEND_SMS",
            "android.permission.READ_SMS",
            "android.permission.CALL_PHONE",
            "android.permission.READ_PHONE_STATE",
            "android.permission.READ_EXTERNAL_STORAGE",
            "android.permission.WRITE_EXTERNAL_STORAGE",
            "android.permission.MANAGE_EXTERNAL_STORAGE"
        )
        
        forbiddenPermissions.forEach { permission ->
            assertFalse(
                "Manifest contains forbidden permission: \$permission",
                content.contains(permission)
            )
        }
    }
}
