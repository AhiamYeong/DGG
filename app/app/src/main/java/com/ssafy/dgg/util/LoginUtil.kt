package com.ssafy.dgg.util

object LoginUtil {
    fun isLoggedIn(): Boolean {
        val cookieManager = android.webkit.CookieManager.getInstance()
        val cookies = cookieManager.getCookie("https://j13a305.p.ssafy.io")
        return cookies?.contains("accessToken=") == true
    }

    fun clearCookies() {
        val cookieManager = android.webkit.CookieManager.getInstance()
        cookieManager.removeAllCookies(null)
        cookieManager.flush()
    }
}