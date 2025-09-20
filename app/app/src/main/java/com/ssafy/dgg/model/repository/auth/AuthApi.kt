package com.ssafy.dgg.model.repository.auth

import com.ssafy.dgg.model.data.GoogleLoginRequest
import com.ssafy.dgg.model.data.TokenResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

/* Retrofit 인터페이스: 서버 엔드포인트 정의
* TODO: API 경로 & 정의 매핑
*   */

interface AuthApi {
    // 로그인 검증
    // JWT가 body가 아니라 set-cookie로
    @POST("auth/google")
    suspend fun loginWithGoogle(
        @Body request: GoogleLoginRequest
    ): Response<Unit>

    // 2️⃣ 토큰 갱신 (선택)
    @POST("/auth/refresh")
    suspend fun refreshToken(
        @Body request: Map<String, String> // {"refreshToken": "..."}
    ): Response<TokenResponse>
}