package com.ssafy.dgg.model.repository.health

import com.ssafy.dgg.model.data.ActivityDataRequest
import com.ssafy.dgg.model.data.SleepDataRequest

interface HealthRepository {
    suspend fun sendSleepData(request: SleepDataRequest): Boolean
    suspend fun sendActivityData(request: ActivityDataRequest): Boolean
}