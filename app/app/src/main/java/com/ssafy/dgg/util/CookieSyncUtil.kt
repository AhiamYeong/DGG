package com.ssafy.dgg.util

import okhttp3.Cookie

/* WebView cookie 저장 */
object CookieSyncUtil {
    fun syncToWebView(baseUrl: String, cookies: List<Cookie>?) {
        if (cookies.isNullOrEmpty()) return

        val cookieManager = android.webkit.CookieManager.getInstance()
        cookieManager.setAcceptCookie(true)

        for (cookie in cookies) {
            cookieManager.setCookie(baseUrl, cookie.toString())
        }
        cookieManager.flush()
    }
}
