package com.ssafy.dgg.model.repository.api

import com.samsung.android.sdk.health.data.HealthDataStore
import com.samsung.android.sdk.health.data.data.AggregatedData
import com.samsung.android.sdk.health.data.request.AggregateRequest
import com.samsung.android.sdk.health.data.request.DataType
import com.samsung.android.sdk.health.data.request.LocalTimeFilter
import com.samsung.android.sdk.health.data.request.LocalTimeGroup
import com.samsung.android.sdk.health.data.request.LocalTimeGroupUnit
import com.samsung.android.sdk.health.data.response.DataResponse
import java.time.LocalDate

class HealthDataRepository(private val store: HealthDataStore) {

    // 걸음수 집계
    private suspend fun getAggregateSteps(
        store: HealthDataStore,
        date: LocalDate
    ): DataResponse<AggregatedData<Long>> {
        val stepsRequest: AggregateRequest<Long> =
            DataType.StepsType.TOTAL.requestBuilder.setLocalTimeFilterWithGroup(
                LocalTimeFilter.of(date.atStartOfDay(), date.plusDays(1).atStartOfDay()),
                LocalTimeGroup.of(LocalTimeGroupUnit.MINUTELY, 30)
            ).build()
        // An API call for an aggregate request.
        return store.aggregateData(stepsRequest)
    }



    suspend fun getSteps(date: LocalDate): List<AggregatedData<Long>> {
        val response: DataResponse<AggregatedData<Long>> =
            getAggregateSteps(store, date)
        return response.dataList
    }

    // suspend fun getActivitySummary(): List<>
}
