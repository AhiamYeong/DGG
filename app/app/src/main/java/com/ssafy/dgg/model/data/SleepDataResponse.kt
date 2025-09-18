package com.ssafy.dgg.model.data

import kotlinx.serialization.Serializable

@Serializable
data class SleepDataResponse (
    val sleepDate: String,
    val sleepScore: Int,
    val sleepDuration: Float,
    val sleepGoal: Float,
)