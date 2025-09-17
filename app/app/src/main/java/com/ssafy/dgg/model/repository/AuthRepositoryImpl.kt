package com.ssafy.dgg.model.repository

import android.util.Log
import com.ssafy.dgg.auth.TokenStorage
import com.ssafy.dgg.model.data.GoogleLoginRequest
import com.ssafy.dgg.model.data.TokenResponse

/* 실제 서버 통신 구현 */
class AuthRepositoryImpl  (
    private val authApi: AuthApi,
): AuthRepository {
    override suspend fun loginWithGoogle(request: GoogleLoginRequest): TokenResponse {
        val response = authApi.loginWithGoogle(request) // 객체 바로 전달
        // val requestBody = GoogleLoginRequest(idToken = idToken)
        if (response.isSuccessful) {
            val body = response.body() ?: throw Exception("서버 응답 없음")
            return TokenResponse(body.accessToken, body.refreshToken)
        } else {
            throw Exception("로그인 실패: ${response.code()} ${response.message()}")
        }
    }

    // TODO: refresh token 로직 추가
    override suspend fun refreshToken(refreshToken: String): TokenResponse {
        val response = authApi.refreshToken(mapOf("refreshToken" to refreshToken))
        if (response.isSuccessful) {
            val body = response.body() ?: throw Exception("서버 응답 없음")
            return TokenResponse(body.accessToken, body.refreshToken)
        } else {
            throw Exception("토큰 갱신 실패: ${response.code()} ${response.message()}")
        }
    }
}