package com.ssafy.dgg.model.data

import kotlinx.serialization.Serializable

@Serializable
data class ProfileUpdateDTO (
    val nickname: String,
)