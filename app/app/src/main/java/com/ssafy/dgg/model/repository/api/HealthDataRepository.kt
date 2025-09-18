package com.ssafy.dgg.model.repository.api

import android.util.Log
import com.samsung.android.sdk.health.data.HealthDataStore
import com.samsung.android.sdk.health.data.data.AggregatedData
import com.samsung.android.sdk.health.data.data.HealthDataPoint
import com.samsung.android.sdk.health.data.data.entries.SleepSession
import com.samsung.android.sdk.health.data.request.AggregateRequest
import com.samsung.android.sdk.health.data.request.DataType
import com.samsung.android.sdk.health.data.request.DataTypes
import com.samsung.android.sdk.health.data.request.LocalTimeFilter
import com.samsung.android.sdk.health.data.request.LocalTimeGroup
import com.samsung.android.sdk.health.data.request.LocalTimeGroupUnit
import com.samsung.android.sdk.health.data.response.DataResponse
import com.ssafy.dgg.model.data.HealthDataResponse
import com.ssafy.dgg.model.data.SleepDataResponse
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId

class HealthDataRepository(private val store: HealthDataStore) {

    // 오늘 날짜 범위 설정
    val today = LocalDate.now()
    val startOfToday = today.atStartOfDay()            // 오늘 00:00
    val endOfToday = today.plusDays(1).atStartOfDay()  // 내일 00:00

    val localTimeFilter = LocalTimeFilter.of(startOfToday, endOfToday)

    suspend fun getSteps(store: HealthDataStore): List<AggregatedData<Long>> {
        val request = DataType.StepsType.TOTAL.requestBuilder
            .setLocalTimeFilter(localTimeFilter)
            .build()

        val response: DataResponse<AggregatedData<Long>> = store.aggregateData(request)

        return response.dataList
    }

    suspend fun getActivitySummary(store: HealthDataStore): List<AggregatedData<*>> {
        val activeTimeRequest = DataType.ActivitySummaryType.TOTAL_ACTIVE_TIME.requestBuilder
            .setLocalTimeFilter(localTimeFilter)
            .build()

        val caloriesBurnedRequest = DataType.ActivitySummaryType.TOTAL_CALORIES_BURNED.requestBuilder
            .setLocalTimeFilter(localTimeFilter)
            .build()

        val totalDistanceRequest = DataType.ActivitySummaryType.TOTAL_DISTANCE.requestBuilder
            .setLocalTimeFilter(localTimeFilter)
            .build()

        val totalActiveCaloriesBurnedRequest = DataType.ActivitySummaryType.TOTAL_ACTIVE_CALORIES_BURNED.requestBuilder
            .setLocalTimeFilter(localTimeFilter)
            .build()

        val res1 : DataResponse<AggregatedData<Duration>> = store.aggregateData(activeTimeRequest)
        val res2 : DataResponse<AggregatedData<Float>> = store.aggregateData(caloriesBurnedRequest)
        val res3 : DataResponse<AggregatedData<Float>> = store.aggregateData(totalDistanceRequest)
        val res4 : DataResponse<AggregatedData<Float>> = store.aggregateData(totalActiveCaloriesBurnedRequest)

        // 결과 합치기
        val combinedList = mutableListOf<AggregatedData<*>>()
        combinedList.addAll(res1.dataList) // TOTAL_ACTIVE_TIME
        combinedList.addAll(res2.dataList) // TOTAL_CALORIES_BURNED
        combinedList.addAll(res3.dataList) // TOTAL_DISTANCE
        combinedList.addAll(res4.dataList) // TOTAL_ACTIVE_CALORIES_BURNED

        return combinedList
    }

    suspend fun getSleepGoal(store: HealthDataStore): List<AggregatedData<LocalTime>> {
        val lastBedTimeRequest = DataType.SleepGoalType.LAST_BED_TIME.requestBuilder.build()
        val lastWakeUpTimeRequest = DataType.SleepGoalType.LAST_WAKE_UP_TIME.requestBuilder.build()

        val bedTimeResponse: DataResponse<AggregatedData<LocalTime>> = store.aggregateData(lastBedTimeRequest)
        val wakeUpTimeResponse: DataResponse<AggregatedData<LocalTime>> = store.aggregateData(lastWakeUpTimeRequest)

        val combinedList = mutableListOf<AggregatedData<LocalTime>>()
        combinedList.addAll(bedTimeResponse.dataList)
        combinedList.addAll(wakeUpTimeResponse.dataList)

        return combinedList
    }

    suspend fun getSleep(store: HealthDataStore): List<HealthDataPoint> {
        val readSleep = DataTypes.SLEEP.readDataRequestBuilder
            .setLocalTimeFilter(localTimeFilter)
            .build()

        val resSleep = store.readData(readSleep).dataList

        return resSleep
    }

    /* DTO로 데이터 변환 */
    suspend fun getHealthDataResponse(store: HealthDataStore): HealthDataResponse {
        val TAG = "dataToDTO"
        Log.d(TAG, "Aggregating health data for DTO...")

        val stepsData = getSteps(store)
        val activityData = getActivitySummary(store)

        // 데이터 집계
        val totalStep = stepsData.firstOrNull()?.value ?: 0L
        val totalActiveTimeSec = (activityData.getOrNull(0)?.value as? java.time.Duration)?.seconds ?: 0L
        val totalCaloriesBurned = (activityData.getOrNull(1)?.value as? Float) ?: 0f
        val totalDistanceM = (activityData.getOrNull(2)?.value as? Float) ?: 0f
        val totalActiveCaloriesBurned = (activityData.getOrNull(3)?.value as? Float) ?: 0f

        return HealthDataResponse(
            windowEnd = Instant.now().atZone(ZoneId.systemDefault()).toString(),
            totalStep = totalStep,
            totalActiveTimeSec = totalActiveTimeSec,
            totalActiveCaloriesBurned = totalActiveCaloriesBurned,
            totalCaloriesBurned = totalCaloriesBurned,
            totalDistanceM = totalDistanceM
        )
    }

    suspend fun getSleepDataResponse(store: HealthDataStore): SleepDataResponse {
        Log.d("dataToDTO", "Aggregating sleep data for DTO...")

        val sleepDataList = getSleep(store)
        val sleepGoalList = getSleepGoal(store)

        // 1. 집계된 수면 데이터 중 첫 번째 값 추출
        val sleepData = sleepDataList.firstOrNull()
        val sleepGoalData = sleepGoalList.firstOrNull()
        val sleepScore = (sleepData?.getValue(DataType.SleepType.SLEEP_SCORE) as? Int) ?: 0

        // 세션 목록
        val sessions = (sleepData?.getValue(DataType.SleepType.SESSIONS) as? List<*>) ?: emptyList<Any>()

        // 총 수면 시간 (세션 duration 합산)
        val totalSleepDuration = sessions.sumOf { (it as? SleepSession)?.duration?.seconds ?: 0L }

        // 수면 날짜 = 첫 세션 기준
        val sleepDate = (sessions.firstOrNull() as? SleepSession)?.startTime
            ?.atZone(ZoneId.systemDefault())?.toLocalDate()?.toString()
            ?: LocalDate.now().toString()

        // 목표 수면 (Instant → Long)
        val goalTimes = sleepGoalData?.value as? Pair<LocalTime, LocalTime>
        val startInstant = goalTimes?.first?.let { LocalDate.now().atTime(it).atZone(ZoneId.systemDefault()).toInstant() }
            ?: Instant.now() // 기본값 fallback
        val endInstant = goalTimes?.second?.let { LocalDate.now().atTime(it).atZone(ZoneId.systemDefault()).toInstant() }
            ?: Instant.now()

        return SleepDataResponse(
            sleepDate = sleepDate,
            sleepScore = sleepScore,
            sleepDuration = totalSleepDuration,
            sleepGoalStart = startInstant.toEpochMilli(),
            sleepGoalEnd = endInstant.toEpochMilli()
        )
    }
}
