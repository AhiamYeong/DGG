package com.ssafy.dgg.auth

import android.content.Context
import android.util.Log
import androidx.core.content.edit

/* 역할: 앱 내에서 인증 관련 토큰 저장/조회/삭제
* 최소 기능 3개만 가지고 있기 saveToken(), getToken(), clearToken() 필요
* */
class TokenStorage(context: Context) {
    private val prefs = context.getSharedPreferences("auth_prefs", Context.MODE_PRIVATE)

    // Accesstoken, refreshtoken 전부 사용 가정
    fun saveAccessToken(token: String) {
        prefs.edit { putString("access_token", token) }
        Log.d("LoginFlow", "AccessToken saved: $token")
    }
    fun getAccessToken() = prefs.getString("access_token", null)

    fun saveRefreshToken(token: String) = prefs.edit { putString("refresh_token", token) }
    fun getRefreshToken() = prefs.getString("refresh_token", null)

    // 로그아웃시 모든 토큰 삭제
    fun clearTokens() = prefs.edit {
        remove("access_token")
        remove("refresh_token")
        Log.d("TokenStorage", "All tokens cleared")
    }
}