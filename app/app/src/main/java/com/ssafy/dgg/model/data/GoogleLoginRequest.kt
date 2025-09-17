package com.ssafy.dgg.model.data

import kotlinx.serialization.Serializable

@Serializable
data class GoogleLoginRequest (
    val idToken: String
)