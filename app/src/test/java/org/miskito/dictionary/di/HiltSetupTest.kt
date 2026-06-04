package org.miskito.dictionary.di

import dagger.hilt.android.testing.HiltAndroidRule
import dagger.hilt.android.testing.HiltAndroidTest
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config
import android.app.Application

@HiltAndroidTest
@RunWith(RobolectricTestRunner::class)
@Config(application = dagger.hilt.android.testing.HiltTestApplication::class)
class HiltSetupTest {

    @get:Rule
    val hiltRule = HiltAndroidRule(this)

    @Test
    fun testHiltInjects() {
        val context = androidx.test.core.app.ApplicationProvider.getApplicationContext<Application>()
        org.junit.Assert.assertNotNull(context)
    }
}
