package com.ssafy.dgg.model.data

import kotlinx.serialization.Serializable

@Serializable
data class SleepDataResponse (
    val sleepDate: String,
    val sleepScore: Int,
    val sleepDuration: Long,
    val sleepGoalStart: Long,
    val sleepGoalEnd: Long,
)