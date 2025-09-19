package com.ssafy.dgg.ui.screen

import androidx.compose.foundation.layout.padding // Ensure this import is present
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier // Ensure this import is present
import androidx.compose.ui.platform.LocalContext
import com.ssafy.dgg.BuildConfig

data class Screen(val route: String, val title: String)

val items = listOf(
    Screen("fatigue", "피로도"),
    Screen("plan", "약속"),
    Screen("route", "길찾기"),
    Screen("alarm", "알림"),
    Screen("mypage", "마이페이지"),
)

val BASE_URL = BuildConfig.WEB_URL

@Composable
fun MainScreen() {
    val context = LocalContext.current
    var selectedItem by remember { mutableStateOf(items.find { it.route == "route" } ?: items[0]) }

    Scaffold (
        bottomBar = {
            NavigationBar {
                items.forEach { screen ->
                    NavigationBarItem(
                        selected = selectedItem == screen,
                        onClick = { selectedItem = screen },
                        icon = { /* TODO: Add icons for navigation items */ },
                        label = { Text(screen.title) }
                    )
                }
            }
        }
    ) { innerPadding ->
        val currentUrl = when (selectedItem.route) {
            "fatigue" -> BASE_URL
            "plan" -> "$BASE_URL/plan"
            "route" -> "$BASE_URL/map"
            "alarm" -> "$BASE_URL/alarm"
            "mypage" -> "$BASE_URL/mypage"
            else -> BASE_URL
        }
        key(currentUrl) {
            WebViewScreen(
                url = currentUrl,
                context = context,
                modifier = Modifier.padding(innerPadding)
            )
        }
    }
}
