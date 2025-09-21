package com.ssafy.dgg.model.data.dto

import kotlinx.serialization.Serializable

/* retrofit test용 코드 */
@Serializable
data class PostDTO (
    val userId: Int,
    val id: Int,
    val title: String,
    val body: String
)