package com.ssafy.dgg.model.data

import kotlinx.serialization.Serializable

/* 객체 List로 전달하기! */
@Serializable
data class HealthDataResponse(
    val windowEnd: String,
    val totalStep: Long,
    val totalActiveTimeSec: Long,
    val totalActiveCaloriesBurned: Double,
    val totalCaloriesBurned: Double,
    val totalDistanceM: Double
)