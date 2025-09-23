package com.ssafy.dgg.model.repository.auth

import android.util.Log
import com.ssafy.dgg.model.data.GoogleLoginRequest

/* 실제 서버 통신 구현 */
class AuthRepositoryImpl  (
    private val authApi: AuthApi,
): AuthRepository {
    override suspend fun loginWithGoogle(request: GoogleLoginRequest): Boolean {
        val response = authApi.loginWithGoogle(request) // 객체 바로 전달
        Log.d("LoginFlow", "request: $request")

        if (response.isSuccessful) {
            // cookieJar 형식으로 변경 (body 제거)
            return true
        } else {
            throw Exception("로그인 실패: ${response.code()} ${response.message()}")

        }
    }

    override suspend fun logout(): Boolean {
        val response = authApi.logout()
        if (response.isSuccessful) return true;
        else throw Exception("로그아웃 실패: ${response.code()} ${response.message()}")
    }

    override suspend fun withdraw(): Boolean {
        val response = authApi.withdraw()
        if (response.isSuccessful) return true;
        else throw Exception("회원탈퇴 실패: ${response.code()} ${response.message()}")
    }

    // TODO: refresh token 로직 추가
    /*override suspend fun refreshToken(refreshToken: String): TokenResponse {
        val response = authApi.refreshToken(mapOf("refreshToken" to refreshToken))
        if (response.isSuccessful) {
            val body = response.body() ?: throw Exception("서버 응답 없음")
            return TokenResponse(body.accessToken, body.refreshToken)
        } else {
            throw Exception("토큰 갱신 실패: ${response.code()} ${response.message()}")
        }
    }*/
}