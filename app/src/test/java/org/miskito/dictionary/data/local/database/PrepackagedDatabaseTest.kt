package org.miskito.dictionary.data.local.database

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import java.io.File
import java.io.FileOutputStream

import org.junit.Ignore

@RunWith(RobolectricTestRunner::class)
class PrepackagedDatabaseTest {

    private lateinit var db: DictionaryDatabase
    private lateinit var context: Context

    @Before
    fun createDb() {
        context = ApplicationProvider.getApplicationContext()
        db = Room.databaseBuilder(
            context,
            DictionaryDatabase::class.java,
            "dictionary.db"
        )
        .createFromAsset("dictionary.db")
        .allowMainThreadQueries()
        .build()
    }

    @After
    fun closeDb() {
        db.close()
    }

    @Test
    fun testPrepackagedDatabase_canBeOpened_andContainsData() = runBlocking {
        val searchDao = db.searchDao()
        val entryDao = db.entryDao()
        
        // We must verify entries, metadata, search_index, favorites, history. 
        // This is done implicitly by executing queries against them if DAOs are provided.
        // Let's verify favorites is empty:
        val favorites = db.favoriteDao().observeFavorites().first()
        assertTrue("Favorites should be empty", favorites.isEmpty())
        
        // Let's verify history is empty:
        val history = db.historyDao().observeHistory().first()
        assertTrue("History should be empty", history.isEmpty())
        
        // Let's verify entries exist:
        // entryDao doesn't have a count method usually, but we could try a raw query or just fetch entry #1
        val cursor = db.openHelper.readableDatabase.query("SELECT COUNT(*) FROM entries")
        cursor.moveToFirst()
        val count = cursor.getInt(0)
        
        val assetFile = File("app/src/main/assets/dictionary.db")
        println("ASSET DB SIZE: ${assetFile.length()}")
        println("COPIED DB SIZE: ${context.getDatabasePath("dictionary.db").length()}")
        
        assertTrue("Entries must exist but was $count. Asset size: ${assetFile.length()}", count > 0)
        cursor.close()
        
        // Tests: Let's see what matches FTS
        fun tryMatch(q: String) {
            var count = 0
            try {
                val cursor = db.openHelper.readableDatabase.query("SELECT COUNT(*) FROM search_index WHERE search_index MATCH '" + q.replace("'", "''") + "'")
                cursor.moveToFirst()
                count = cursor.getInt(0)
                cursor.close()
            } catch (e: Exception) {
                println("MATCH ERROR for [$q]: ${e.message}")
                return
            }
            println("MATCH RESULT for [$q]: $count")
        }
        
        tryMatch("ba* de*")
        tryMatch("headword:ba* OR normalized_headword:ba*")
        tryMatch("spanish_text:la*")
        
        try {
            val cur = db.openHelper.readableDatabase.query("SELECT COUNT(*) FROM search_index WHERE spanish_text IS NOT NULL AND spanish_text != ''")
            cur.moveToFirst()
            println("COUNT OF SPANISH TEXT: " + cur.getInt(0))
            cur.close()
        } catch(e: Exception){}
    }
}
