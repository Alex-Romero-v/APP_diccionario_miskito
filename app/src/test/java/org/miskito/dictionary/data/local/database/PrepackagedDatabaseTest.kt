package org.miskito.dictionary.data.local.database

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner

@RunWith(RobolectricTestRunner::class)
class PrepackagedDatabaseTest {

    private lateinit var context: Context
    private lateinit var db: DictionaryDatabase

    @Before
    fun createDb() {
        context = ApplicationProvider.getApplicationContext()
        context.deleteDatabase(TEST_DB_NAME)

        db = Room.databaseBuilder(
            context,
            DictionaryDatabase::class.java,
            TEST_DB_NAME
        )
            .createFromAsset("dictionary.db")
            .allowMainThreadQueries()
            .build()
    }

    @After
    fun closeDb() {
        db.close()
        context.deleteDatabase(TEST_DB_NAME)
    }

    @Test
    fun prepackagedDatabase_opensFromAsset_andQueriesCriticalTables() {
        val readableDatabase = db.openHelper.readableDatabase

        assertEquals(EXPECTED_ENTRIES, queryLong("SELECT COUNT(*) FROM entries"))
        assertEquals(EXPECTED_ENTRIES, queryLong("SELECT CAST(value AS INTEGER) FROM metadata WHERE key = 'entriesCount'"))
        assertEquals(EXPECTED_ENTRIES, queryLong("SELECT COUNT(*) FROM search_index"))

        for (tableName in CRITICAL_TABLES) {
            assertTrue(
                "$tableName should be queryable",
                queryLong("SELECT COUNT(*) FROM $tableName") >= 0
            )
        }

        assertTrue(
            "search_index should support FTS MATCH queries",
            readableDatabase.query("SELECT COUNT(*) FROM search_index WHERE search_index MATCH 'ba*'").use { cursor ->
                cursor.moveToFirst()
                cursor.getLong(0) >= 0
            }
        )
    }

    private fun queryLong(sql: String): Long {
        return db.openHelper.readableDatabase.query(sql).use { cursor ->
            assertTrue("Query returned no rows: $sql", cursor.moveToFirst())
            cursor.getLong(0)
        }
    }

    private companion object {
        const val TEST_DB_NAME = "t035-dictionary.db"
        const val EXPECTED_ENTRIES = 6386L

        val CRITICAL_TABLES = listOf(
            "entries",
            "metadata",
            "translations",
            "variants",
            "examples",
            "notes",
            "\"references\"",
            "entry_references",
            "phrases",
            "search_index"
        )
    }
}
