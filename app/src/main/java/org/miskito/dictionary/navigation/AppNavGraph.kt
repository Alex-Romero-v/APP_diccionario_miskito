package org.miskito.dictionary.navigation

import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import org.miskito.dictionary.ui.about.AboutScreen
import org.miskito.dictionary.ui.entrydetail.EntryDetailScreen
import org.miskito.dictionary.ui.favorites.FavoritesScreen
import org.miskito.dictionary.ui.history.HistoryScreen
import org.miskito.dictionary.ui.phrases.PhrasesScreen
import org.miskito.dictionary.ui.search.SearchScreen
import org.miskito.dictionary.ui.settings.SettingsScreen

@Composable
fun AppNavGraph(
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController()
) {
    NavHost(
        navController = navController,
        startDestination = AppRoutes.SEARCH,
        modifier = modifier
    ) {
        composable(AppRoutes.SEARCH) {
            SearchScreen(
                onNavigateToEntry = { entryId ->
                    navController.navigate(AppRoutes.createEntryRoute(entryId))
                }
            )
        }
        
        composable(
            route = AppRoutes.ENTRY,
            arguments = listOf(
                navArgument("entryId") { type = NavType.LongType }
            )
        ) { backStackEntry ->
            val entryId = backStackEntry.arguments?.getLong("entryId") ?: 0L
            EntryDetailScreen(
                entryId = entryId,
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable(AppRoutes.FAVORITES) {
            FavoritesScreen(
                onNavigateToEntry = { entryId ->
                    navController.navigate(AppRoutes.createEntryRoute(entryId))
                }
            )
        }
        
        composable(AppRoutes.HISTORY) {
            HistoryScreen(
                onNavigateToEntry = { entryId ->
                    navController.navigate(AppRoutes.createEntryRoute(entryId))
                }
            )
        }
        
        composable(AppRoutes.PHRASES) {
            PhrasesScreen()
        }
        
        composable(AppRoutes.SETTINGS) {
            SettingsScreen()
        }
        
        composable(AppRoutes.ABOUT) {
            AboutScreen()
        }
    }
}

