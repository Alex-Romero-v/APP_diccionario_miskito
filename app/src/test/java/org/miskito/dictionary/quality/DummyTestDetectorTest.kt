package org.miskito.dictionary.quality

import org.junit.Test
import java.io.File
import org.junit.Assert.fail

class DummyTestDetectorTest {

    @Test
    fun detectDummyTests() {
        val rootDir = File("src")
        val testDirs = listOf(
            File(rootDir, "test/java/org/miskito/dictionary"),
            File(rootDir, "androidTest/java/org/miskito/dictionary")
        )

        val forbiddenPatterns = listOf(
            "assertTrue(true)",
            "assertEquals(true, true)",
            "assertThat(true).isTrue()",
            "assertThat(true).isEqualTo(true)",
            "Truth.assertThat(true).isTrue()",
            "check(true)",
            "require(true)"
        )

        val errors = mutableListOf<String>()

        testDirs.forEach { dir ->
            if (dir.exists()) {
                dir.walkTopDown()
                    .filter { it.isFile && it.extension == "kt" }
                    .filter { it.name != "DummyTestDetectorTest.kt" }
                    .forEach { file ->
                        val content = file.readText()
                        
                        forbiddenPatterns.forEach { pattern ->
                            if (content.contains(pattern)) {
                                errors.add("File ${file.path} contains forbidden pattern: $pattern")
                            }
                        }

                        val testBlocks = content.split("@Test").drop(1)
                        for (block in testBlocks) {
                            val functionNameMatch = Regex("fun\\s+(\\w+)\\s*\\(").find(block)
                            val functionName = functionNameMatch?.groupValues?.get(1) ?: "unknown"
                            val functionBody = block
                            
                            val hasAssertion = listOf("assert", "verify", "onNode", "check", "require", "fail", "testRule", "composeTestRule", "throw", "expect").any { functionBody.contains(it) }
                            
                            if (!hasAssertion) {
                                errors.add("File ${file.path} contains @Test function '$functionName' without visible assertions or Compose interactions.")
                            }
                        }
                    }
            }
        }

        if (errors.isNotEmpty()) {
            fail("Dummy tests detected:\\n${errors.joinToString("\\n")}")
        }
    }
}
