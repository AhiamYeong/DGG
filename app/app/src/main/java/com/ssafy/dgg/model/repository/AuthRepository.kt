package com.ssafy.dgg.model.repository

import com.ssafy.dgg.model.data.GoogleLoginRequest
import com.ssafy.dgg.model.data.TokenResponse
import retrofit2.http.Body

/* Repository 인터페이스 */
interface AuthRepository {
    suspend fun loginWithGoogle(request: GoogleLoginRequest): TokenResponse
    // TODO: refreshtoken 알아보기..ㅎ
    // suspend fun refreshToken(refreshToken: String): TokenResponse
}
