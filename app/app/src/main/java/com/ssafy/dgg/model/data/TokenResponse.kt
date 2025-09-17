package com.ssafy.dgg.model.data

import kotlinx.serialization.Serializable

/* TODO: Response 타입 확실히 되면 변경 */
@Serializable
data class TokenResponse (
    val accessToken: String,
    val refreshToken: String,
)
