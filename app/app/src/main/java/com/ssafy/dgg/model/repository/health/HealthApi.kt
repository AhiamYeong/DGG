package com.ssafy.dgg.model.repository.health

import com.ssafy.dgg.model.data.ActivityDataRequest
import com.ssafy.dgg.model.data.SleepDataRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

/* Health data 서버에 전송 */
interface HealthApi {
    // 수면데이터 업데이트
    @POST("health/sleep")
    suspend fun sendSleepData(@Body request: SleepDataRequest): Response<Unit>

    // 건강데이터 업데이트
    @POST("health/activity")
    suspend fun sendActivityData(@Body request: ActivityDataRequest): Response<Unit>
}