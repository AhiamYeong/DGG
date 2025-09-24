package com.ssafy.dgg.ui.screen

import AuthViewModel
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
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
fun MainScreen(
    authViewModel: AuthViewModel
) {
    val context = LocalContext.current
    var selectedItem by remember { mutableStateOf(items.find { it.route == "route" } ?: items[0]) }

    Scaffold(
        bottomBar = {
            NavigationBar {
                items.forEach { screen ->
                    NavigationBarItem(
                        selected = selectedItem == screen,
                        onClick = { selectedItem = screen },
                        icon = { /* TODO: Add icons */ },
                        label = { Text(screen.title) }
                    )
                }
            }
        }
    ) { innerPadding ->
        when (selectedItem.route) {
            "fatigue" -> WebViewScreen(
                url = "$BASE_URL/fatigue",
                context = context,
                modifier = Modifier.padding(innerPadding)
            )
            "plan" -> WebViewScreen(
                url = "$BASE_URL/plan",
                context = context,
                modifier = Modifier.padding(innerPadding)
            )
            "route" -> WebViewScreen(
                url = "$BASE_URL/map",
                context = context,
                modifier = Modifier.padding(innerPadding)
            )
            "alarm" -> WebViewScreen(
                url = "$BASE_URL/alarm",
                context = context,
                modifier = Modifier.padding(innerPadding)
            )
            "mypage" -> {
                MyPageScreen(
                    modifier = Modifier.padding(innerPadding),
                    authViewModel = authViewModel
                )
            }
        }
    }
}
