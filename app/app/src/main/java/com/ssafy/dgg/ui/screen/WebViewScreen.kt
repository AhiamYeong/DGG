package com.ssafy.dgg.ui.screen // 패키지명은 실제 프로젝트에 맞게 조정하세요.

import android.content.Context
import android.view.ViewGroup
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

@Composable
fun WebViewScreen(
    url: String,
    context: Context, // Context는 AndroidView 팩토리에서 필요할 수 있습니다.
    modifier: Modifier = Modifier // Add modifier parameter
) {
    // AndroidView를 사용하여 WebView를 Compose에 통합
    AndroidView(
        factory = { ctx ->
            WebView(ctx).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
                webViewClient = WebViewClient() // 기본적인 WebViewClient 설정
                settings.javaScriptEnabled = true // JavaScript 활성화 (필요에 따라)
                loadUrl(url)
            }
        },
        update = { webView ->
            webView.loadUrl(url) // URL이 변경되면 웹뷰를 업데이트
        },
        modifier = modifier // 전달받은 modifier를 여기에 적용 (fillMaxSize 포함 가능)
        // .fillMaxSize() // 필요에 따라 여기에 fillMaxSize를 유지하거나 외부에서 관리
    )
}

// 만약 WebViewScreen이 BoxWithConstraints 등으로 감싸져 있다면,
// 그 Box에 modifier를 적용할 수도 있습니다.
// 예시:
// @Composable
// fun WebViewScreen(
//    url: String,
//    context: Context,
//    modifier: Modifier = Modifier
// ) {
//    BoxWithConstraints(modifier = modifier) { // Apply padding to the Box
//        AndroidView(
//            factory = { ctx ->
//                WebView(ctx).apply {
//                    layoutParams = ViewGroup.LayoutParams(
//                        ViewGroup.LayoutParams.MATCH_PARENT,
//                        ViewGroup.LayoutParams.MATCH_PARENT
//                    )
//                    webViewClient = WebViewClient()
//                    settings.javaScriptEnabled = true
//                    loadUrl(url)
//                }
//            },
//            update = { webView ->
//                webView.loadUrl(url)
//            },
//            modifier = Modifier.fillMaxSize() // AndroidView는 Box를 채우도록
//        )
//    }
// }
