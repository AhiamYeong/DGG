package com.ssafy.dgg.model.repository.auth

import com.ssafy.dgg.model.data.GoogleLoginRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.PATCH
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

    /*
    @POST("auth/refresh")
    suspend fun refreshToken(
        @Body request: Map<String, String> // {"refreshToken": "..."}
    ): Response<TokenResponse>
    */

    // 로그아웃
    @POST("auth/logout")
    suspend fun logout(): Response<Unit>

    // 회원탈퇴
    @PATCH("auth/withdraw")
    suspend fun withdraw(): Response<Unit>
}