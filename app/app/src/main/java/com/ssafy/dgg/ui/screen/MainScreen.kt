package com.ssafy.dgg.ui.screen

import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text // Added missing Text import
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue // Added this import
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue // Added this import
import androidx.compose.ui.platform.LocalContext

data class Screen(val route: String, val title: String)

val items = listOf(
    Screen("fatigue", "피로도"),
    Screen("plan", "약속"),
    Screen("route", "길찾기"),
    Screen("alarm", "알림"),
    Screen("mypage", "마이페이지"),
)

val BASE_URL = "http://70.12.247.55:3000" // 추후 util 분리

@Composable
fun MainScreen() {
    val context = LocalContext.current
    var selectedItem by remember { mutableStateOf(items[0]) }

    Scaffold (
        bottomBar = {
            NavigationBar {
                items.forEach { screen ->
                    NavigationBarItem(
                        selected = selectedItem == screen,
                        onClick = { selectedItem = screen },
                        icon = {}, // 여기에 아이콘 추가
                        label = { Text(screen.title) }
                    )
                }
            }
        }
    ) { innerPadding ->
//        네비게이션 바 클릭에 따라 웹뷰 URL 변경
        val currentUrl = when (selectedItem.route) {
            // base URL
            "fatigue" -> BASE_URL
            "plan" -> "$BASE_URL/plan"
            "route" -> "$BASE_URL/map-test"
            "alarm" -> "$BASE_URL/alarm"
            "mypage" -> "$BASE_URL/mypage"
            else -> BASE_URL
        }
        // Assuming WebViewScreen is defined elsewhere and handles innerPadding
        WebViewScreen(url = currentUrl, context = context /*, innerPadding = innerPadding */)
    }
}

