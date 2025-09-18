package com.ssafy.dgg.viewModel

import android.app.Activity
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.samsung.android.sdk.health.data.HealthDataStore
import com.samsung.android.sdk.health.data.data.AggregatedData
import com.samsung.android.sdk.health.data.request.DataType
import com.ssafy.dgg.model.data.HealthDataResponse
import com.ssafy.dgg.model.repository.api.HealthDataRepository
import com.ssafy.dgg.model.repository.api.HealthPermissionRepository
import com.ssafy.dgg.ui.screen.items
import com.ssafy.dgg.util.HealthStoreProvider
import com.ssafy.dgg.util.formatDuration
import kotlinx.coroutines.launch
import java.time.LocalDate
class HealthViewModel(
    private val permissionRepo: HealthPermissionRepository,
    private val dataRepo: HealthDataRepository
) : ViewModel() {

    private val _steps = MutableLiveData<List<AggregatedData<Long>>>()

    // public get을 통해 외부에서 값에 접근
    val steps: LiveData<List<AggregatedData<Long>>>
        get() = _steps


    fun loadHealthDatas(activity: Activity) {
        viewModelScope.launch {
            // 1. 현재 권한 상태 확인
            var hasPermission = permissionRepo.hasPermissions()

            // 2. 권한이 없으면 요청 → 결과값 반영
            if (!hasPermission) {
                val granted = permissionRepo.requestPermissions(activity)
                hasPermission = granted
                if (!granted) {
                    Log.d("Health", "권한 거부됨")
                    return@launch   // 아예 함수 종료
                } else {
                    Log.d("Health", "권한 허용됨")
                }
            } else {
                Log.d("Health", "이미 권한 있음")
            }

            val store = HealthStoreProvider.getStore(activity.applicationContext)
            val TAG = "health data preview"
            // 3. 여기까지 왔으면 권한 있는 상태 → 데이터 불러오기
            _steps.value = dataRepo.getSteps(store).also { list ->
                list.forEach { item ->
                    Log.d(TAG, "steps ${item.value}")
                    Log.d(TAG, "steps ${item.startTime} ~ ${item.endTime}")
                }
            }

            dataRepo.getActivitySummary(store).also { list ->
                list.forEach { item ->
                    Log.d(TAG, "activities: ${item.value}")
                }
            }

            dataRepo.getSleepGoal(store).also { list ->
                list.forEach { item ->
                    Log.d(TAG, "수면 목표: ${item.value}")
                }
            }

            dataRepo.getSleep(store).also {  list ->
                list.forEach { item ->
                    val s1 = item.getValue(DataType.SleepType.SLEEP_SCORE)
                    val s2 = item.getValue(DataType.SleepType.DURATION)
                    val sleepSession = item.getValue(DataType.SleepType.SESSIONS)

                    Log.d(TAG, "**sleep session**")
                    sleepSession?.forEach { item ->
                        Log.d(TAG, "수면시간: ${formatDuration(item.duration)}")
                        Log.d(TAG, "수면시작: ${item.startTime.toString()}")
                        Log.d(TAG, "수면끝: ${item.endTime.toString()}")
                    }

                    /*val s4 = item.getValue(DataType.SleepType.*/
                    Log.d(TAG, "score: $s1")
                    Log.d(TAG, "sleep duration: ${formatDuration(s2)}")
                }
            }

            val dto = dataRepo.getHealthDataResponse(store)
            Log.d("dataToDTO", "DTO: $dto")
            val dto2 = dataRepo.getSleepDataResponse(store)
            Log.d("dataToDTO", "DTO: $dto2")
        }
    }

}