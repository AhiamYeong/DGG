package com.ssafy.dgg.model.data

import kotlinx.serialization.Serializable

/* 건강 데이터 업데이트: 앱 접속중일 때 10분마다 호출 */
@Serializable
data class HealthDataResponse(
    val windowEnd: String, // 마지막 전송 시간
    val totalStep: Long,
    val totalActiveTimeSec: Long,
    val totalActiveCaloriesBurned: Float,
    val totalCaloriesBurned: Float,
    val totalDistanceM: Float,
)