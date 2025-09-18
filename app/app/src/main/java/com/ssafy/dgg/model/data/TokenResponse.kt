package com.ssafy.dgg.model.data

import kotlinx.serialization.Serializable

/* TODO: Response 타입 확실히 되면 변경 */
@Serializable
data class TokenResponse (
    val sub: String,
    val expiresIn: Int,
    val tokenType: String,
    val email: String,
    val nickname: String,
    val accessToken: String,
)
