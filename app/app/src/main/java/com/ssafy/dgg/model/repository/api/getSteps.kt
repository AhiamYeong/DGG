/*
package com.ssafy.dgg.model.repository.api

import com.samsung.android.sdk.health.data.data.AggregatedData
import com.samsung.android.sdk.health.data.response.DataResponse
import java.time.LocalDate
import kotlin.collections.map

suspend fun getSteps(date: LocalDate): List<StepData> {

    val response: DataResponse<AggregatedData<Long>> = getAggregateResult(store, date)
    return response.dataList.map { data ->
        StepData(
            steps = data.value,
            startTime = data.startTime,
            endTime = data.endTime
        )
    }
}
*/
