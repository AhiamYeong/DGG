package com.ssafy.dgg.ui.screen

import AuthViewModel
import android.content.Context
import android.view.ViewGroup
import android.webkit.WebView
import androidx.activity.ComponentActivity
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
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
import androidx.compose.ui.viewinterop.AndroidView
import androidx.compose.ui.zIndex
import com.ssafy.dgg.BuildConfig

data class Screen(val route: String, val title: String)

val items = listOf(
    Screen("main", "메인"),
    Screen("fatigue", "피로도"),
    Screen("map", "길찾기"),
    Screen("alarm", "알림"),
    Screen("mypage", "마이페이지"),
)

val BASE_URL = BuildConfig.WEB_URL

@Composable
fun MainScreen(authViewModel: AuthViewModel) {
    val context = LocalContext.current
    var selectedItem by remember { mutableStateOf(items[0]) }

    // WebView 인스턴스를 한 번만 생성
    val mainWebView = remember { context.createConfiguredWebView("$BASE_URL/") }
    val fatigueWebView = remember { context.createConfiguredWebView("$BASE_URL/fatigue") }
    val mapWebView = remember { context.createConfiguredWebView("$BASE_URL/map") }
    val alarmWebView = remember { context.createConfiguredWebView("$BASE_URL/alarm") }

    // 현재 생성된 웹뷰 추적
    val currentWebView = when (selectedItem.route) {
        "main" -> mainWebView
        "fatigue" -> fatigueWebView
        "map" -> mapWebView
        "alarm" -> alarmWebView
        else -> null
    }

    // 뒤로가기 핸들링
    BackHandler {
        if (currentWebView?.canGoBack() == true) {
            currentWebView.goBack()
        } else {
            // 더 이상 뒤로 갈 페이지 없으면 앱 종료
            (context as? ComponentActivity)?.finish()
        }
    }

    Scaffold(
        bottomBar = {
            NavigationBar {
                items.forEach { screen ->
                    NavigationBarItem(
                        selected = selectedItem == screen,
                        onClick = { selectedItem = screen },
                        label = { Text(screen.title) },
                        icon = {}
                    )
                }
            }
        }
    ) { innerPadding ->
        Box(Modifier.padding(innerPadding)) {

            // ✅ 항상 트리에 남겨두고 alpha 로만 제어
            AndroidView({ mainWebView },
                modifier = Modifier
                    .fillMaxSize()
                    .zIndex(if (selectedItem.route == "main") 1f else 0f))

            AndroidView({ fatigueWebView },
                modifier = Modifier
                    .fillMaxSize()
                    .zIndex(if (selectedItem.route == "fatigue") 1f else 0f))

            AndroidView({ mapWebView },
                modifier = Modifier
                    .fillMaxSize()
                    .zIndex(if (selectedItem.route == "map") 1f else 0f))

            AndroidView({ alarmWebView },
                modifier = Modifier
                    .fillMaxSize()
                    .zIndex(if (selectedItem.route == "alarm") 1f else 0f))

            if (selectedItem.route == "mypage") {
                MyPageScreen(
                    modifier = Modifier.fillMaxSize(),
                    authViewModel = authViewModel
                )
            }
        }
    }
}

fun Context.createConfiguredWebView(url: String): WebView =
    WebView(this).apply {
        layoutParams = ViewGroup.LayoutParams(
            ViewGroup.LayoutParams.MATCH_PARENT,
            ViewGroup.LayoutParams.MATCH_PARENT
        )
        webViewClient = CustomWebViewClient()
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        loadUrl(url)
    }
