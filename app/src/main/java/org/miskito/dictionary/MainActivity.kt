package org.miskito.dictionary

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import dagger.hilt.android.AndroidEntryPoint
import org.miskito.dictionary.navigation.AppNavGraph
import org.miskito.dictionary.navigation.AppRoutes
import org.miskito.dictionary.ui.theme.MyApplicationTheme

import androidx.compose.material.icons.automirrored.filled.List

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    enableEdgeToEdge()
    setContent {
      MyApplicationTheme {
        val navController = rememberNavController()
        
        Scaffold(
            modifier = Modifier.fillMaxSize(),
            bottomBar = {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentRoute = navBackStackEntry?.destination?.route
                
                if (currentRoute != AppRoutes.ENTRY) {
                    NavigationBar {
                        NavigationBarItem(
                            icon = { Icon(Icons.Default.Search, contentDescription = "Buscar") },
                            label = { Text("Buscar") },
                            selected = currentRoute == AppRoutes.SEARCH,
                            onClick = { navController.navigate(AppRoutes.SEARCH) { launchSingleTop = true } }
                        )
                        NavigationBarItem(
                            icon = { Icon(Icons.Default.Favorite, contentDescription = "Favoritos") },
                            label = { Text("Favoritos") },
                            selected = currentRoute == AppRoutes.FAVORITES,
                            onClick = { navController.navigate(AppRoutes.FAVORITES) { launchSingleTop = true } }
                        )
                        NavigationBarItem(
                            icon = { Icon(Icons.AutoMirrored.Filled.List, contentDescription = "Historial") },
                            label = { Text("Historial") },
                            selected = currentRoute == AppRoutes.HISTORY,
                            onClick = { navController.navigate(AppRoutes.HISTORY) { launchSingleTop = true } }
                        )
                        NavigationBarItem(
                            icon = { Icon(Icons.Default.Settings, contentDescription = "Ajustes") },
                            label = { Text("Ajustes") },
                            selected = currentRoute == AppRoutes.SETTINGS || currentRoute == AppRoutes.ABOUT,
                            onClick = { navController.navigate(AppRoutes.SETTINGS) { launchSingleTop = true } }
                        )
                    }
                }
            }
        ) { innerPadding ->
          AppNavGraph(
              navController = navController,
              modifier = Modifier.padding(innerPadding)
          )
        }
      }
    }
  }
}

