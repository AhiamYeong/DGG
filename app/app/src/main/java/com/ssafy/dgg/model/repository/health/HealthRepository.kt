package com.ssafy.dgg.model.repository.health

import com.ssafy.dgg.model.data.ActivityDataRequest
import com.ssafy.dgg.model.data.SleepAndStepsDataRequest

interface HealthRepository {
    suspend fun sendSleepAndStepsData(request: SleepAndStepsDataRequest): Boolean
    suspend fun sendActivityData(request: ActivityDataRequest): Boolean
}