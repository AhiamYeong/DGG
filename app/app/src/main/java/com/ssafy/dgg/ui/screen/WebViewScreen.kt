package com.ssafy.dgg.ui.screen

import android.annotation.SuppressLint
import android.content.Context
import android.view.ViewGroup
import android.webkit.JavascriptInterface
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.Composable
import androidx.compose.ui.viewinterop.AndroidView

// 웹에서 안드로이드 함수 호출하기 위한 브릿지 클래스
class WebAppInterface(private val context: Context) {
    @JavascriptInterface
    fun showToast(toast: String) {
        // 웹에서 "Android.showToast('메시지')"를 호출하면 이 함수가 실행됨
        // Toast.makeText(context, toast, Toast.LENGTH_SHORT).show()
        // 실제로는 여기에서 네이티브 기능을 실행합니다. (예: 삼성 헬스 SDK 호출 등)
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun WebViewScreen(url: String, context: Context) {
    AndroidView(
        factory = {
            WebView(it).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
                webViewClient = WebViewClient()
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true

                // 웹 -> 네이티브 통신 브릿지 설정
                addJavascriptInterface(WebAppInterface(context), "Android")

                // 초기 URL 로드
                loadUrl(url)
            }
        },
        update = { webView ->
            // 현재 url, 새 url이 다를 때만 로드
            if (webView.url != url) {
                webView.loadUrl(url)
            }
        }
    )
}