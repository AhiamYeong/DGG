package com.ssafy.dgg.model.repository.health

import com.ssafy.dgg.model.data.ActivityDataRequest
import com.ssafy.dgg.model.data.SleepAndStepsDataRequest

class HealthRepositoryImpl  (
    private val healthApi: HealthApi
) : HealthRepository {
    override suspend fun sendSleepAndStepsData(request: SleepAndStepsDataRequest): Boolean {
        return try {
            val response = healthApi.sendSleepAndStepsData(request)
            // 서버 내 http 예외 처리
            if (response.isSuccessful) true   // 200 OK
            else false  // 400, 401, 403, 500 등 서버 에러 응답
        } catch (e: Exception) { // 네트워크 계층 예외처리 (인터넷 끊김, 타임아웃 등)
            e.printStackTrace()
            false
        }
    }

    override suspend fun sendActivityData(request: ActivityDataRequest): Boolean {
        return try {
            val response = healthApi.sendActivityData(request)
            // 서버 내 http 예외 처리
            if (response.isSuccessful) true   // 200 OK
            else false  // 400, 401, 403, 500 등 서버 에러 응답
        } catch (e: Exception) { // 네트워크 계층 예외처리 (인터넷 끊김, 타임아웃 등)
            e.printStackTrace()
            false
        }
    }

}