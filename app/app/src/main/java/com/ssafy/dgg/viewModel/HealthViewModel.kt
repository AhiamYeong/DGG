package com.ssafy.dgg.viewModel

import android.app.Activity
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.samsung.android.sdk.health.data.data.AggregatedData
import com.samsung.android.sdk.health.data.request.DataType
import com.ssafy.dgg.model.repository.health.HealthDataRepository
import com.ssafy.dgg.model.repository.health.HealthPermissionRepository
import com.ssafy.dgg.model.repository.health.HealthRepository
import com.ssafy.dgg.util.HealthStoreProvider
import com.ssafy.dgg.util.formatDuration
import kotlinx.coroutines.launch

/* 데이터 1회 데이터 전송
* TODO: 스케쥴링 처리 */
class HealthViewModel(
    private val permissionRepo: HealthPermissionRepository,
    private val dataRepo: HealthDataRepository,
    private val healthRepo: HealthRepository,
) : ViewModel() {

    private val _steps = MutableLiveData<List<AggregatedData<Long>>>()

    // public get을 통해 외부에서 값에 접근
    val steps: LiveData<List<AggregatedData<Long>>>
        get() = _steps

    // 1회 앱 호출시 전송
    private val _activityStatus = MutableLiveData<String>()
    val activityStatus: LiveData<String> = _activityStatus

    private val _sleepStatus = MutableLiveData<String>()
    val sleepStatus: LiveData<String> = _sleepStatus

    fun loadHealthDatas(activity: Activity) {
        viewModelScope.launch {
            // 1. 현재 권한 상태 확인
            var hasPermission = permissionRepo.hasPermissions()

            // 2. 권한이 없으면 요청 → 결과값 반영
            if (!hasPermission) {
                val granted = permissionRepo.requestPermissions(activity)
                if (!granted) {
                    _activityStatus.value = "권한 거부됨"
                    _sleepStatus.value = "권한 거부됨"
                    return@launch
                }
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

            // 데이터 정제하기
            val activityDTO = dataRepo.getHealthDataResponse(store)
            val sleepDTO = dataRepo.getSleepDataResponse(store)

            // 활동 데이터 전송
            val activitySuccess = healthRepo.sendActivityData(activityDTO)
            _activityStatus.value =
                if (activitySuccess) "활동 데이터 전송 성공" else "활동 데이터 전송 실패"

            // 수면 데이터 전송
            val sleepSuccess = healthRepo.sendSleepData(sleepDTO)
            _sleepStatus.value =
                if (sleepSuccess) "수면 데이터 전송 성공" else "수면 데이터 전송 실패"
        }
    }

}