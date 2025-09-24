package com.ssafy.dgg.model.data

import kotlinx.serialization.Serializable

@Serializable
data class ProfileResponse (
    val nickname: String,
    val email: String,
)