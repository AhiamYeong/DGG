package com.ssafy.dgg.model.repository.auth

import com.ssafy.dgg.model.data.GoogleLoginRequest
import com.ssafy.dgg.model.data.TokenResponse

/* Repository 인터페이스 */
interface AuthRepository {
    // cookieJar 형태로 변경 -> response 안 내려오고 cookiejar가 가져가게 됨
    suspend fun loginWithGoogle(request: GoogleLoginRequest): Boolean
    // TODO: refreshtoken 알아보기..ㅎ
    // suspend fun refreshToken(refreshToken: String): TokenResponse
}
