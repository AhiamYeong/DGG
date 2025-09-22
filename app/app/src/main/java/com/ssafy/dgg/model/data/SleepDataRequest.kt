package com.ssafy.dgg.model.data

import kotlinx.serialization.Serializable

@Serializable
data class SleepDataRequest (
    val sleepDate: String, // 전송 일자
    val sleepScore: Int, // 워치 없으면 대부분 공란
    val sleepDuration: Long, // epoch milliseconds
)