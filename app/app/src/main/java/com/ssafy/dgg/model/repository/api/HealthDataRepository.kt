package com.ssafy.dgg.model.repository.api

import com.samsung.android.sdk.health.data.HealthDataStore
import com.samsung.android.sdk.health.data.data.AggregatedData
import com.samsung.android.sdk.health.data.data.HealthDataPoint
import com.samsung.android.sdk.health.data.request.AggregateRequest
import com.samsung.android.sdk.health.data.request.DataType
import com.samsung.android.sdk.health.data.request.DataTypes
import com.samsung.android.sdk.health.data.request.LocalTimeFilter
import com.samsung.android.sdk.health.data.request.LocalTimeGroup
import com.samsung.android.sdk.health.data.request.LocalTimeGroupUnit
import com.samsung.android.sdk.health.data.response.DataResponse
import java.time.Duration
import java.time.LocalDate
import java.time.LocalTime

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
}
