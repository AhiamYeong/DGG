package com.ssafy.dgg.model.repository

import com.ssafy.dgg.model.data.TokenResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

/* Retrofit 인터페이스: 서버 엔드포인트 정의 */

interface AuthApi {
    // 1️⃣ 구글 로그인: ID Token 전달 → Access/Refresh Token 발급
    @POST("/auth/google-login")
    suspend fun loginWithGoogle(
        @Body request: GoogleLoginRequest
    ): Response<TokenResponse>

    // 2️⃣ 토큰 갱신 (선택)
    @POST("/auth/refresh")
    suspend fun refreshToken(
        @Body request: Map<String, String> // {"refreshToken": "..."}
    ): Response<TokenResponse>
}