package com.ssafy.dgg.viewModel

import android.app.Activity
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.samsung.android.sdk.health.data.HealthDataStore
import com.samsung.android.sdk.health.data.request.DataType
import com.ssafy.dgg.model.repository.health.HealthDataRepository
import com.ssafy.dgg.model.repository.health.HealthPermissionRepository
import com.ssafy.dgg.model.repository.health.HealthRepository
import com.ssafy.dgg.util.HealthStoreProvider
import com.ssafy.dgg.util.formatDuration
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

/* 데이터 1회 데이터 전송
* TODO: 스케쥴링 처리 */
class HealthViewModel(
    private val permissionRepo: HealthPermissionRepository,
    private val dataRepo: HealthDataRepository,
    private val healthRepo: HealthRepository,
) : ViewModel() {

    // 1회 앱 호출시 전송
    private val _activityStatus = MutableLiveData<String>()
    val activityStatus: LiveData<String> = _activityStatus

    private val _sleepStatus = MutableLiveData<String>()
    val sleepStatus: LiveData<String> = _sleepStatus

    // 함수 주기 실행
    private var periodicJob: Job? = null

    // 데이터 전송
    fun sendSleepData(activity: Activity) {
        viewModelScope.launch {
            val store = HealthStoreProvider.getStore(activity.applicationContext)
            val sleepDTO = dataRepo.getSleepDataResponse(store)
            val success = healthRepo.sendSleepData(sleepDTO)
            _sleepStatus.value = if (success) "수면 데이터 전송 성공" else "수면 데이터 전송 실패"
        }
    }
    
    fun sendActivityData(activity: Activity){
        viewModelScope.launch {
            val store = HealthStoreProvider.getStore(activity.applicationContext)
            val activityDTO = dataRepo.getHealthDataResponse(store)
            val success = healthRepo.sendActivityData(activityDTO)
            _activityStatus.value = if (success) "활동 데이터 전송 성공" else "활동 데이터 전송 실패"
        }
    }

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

            // 전송 함수 실행
            sendSleepData(activity)
            sendActivityData(activity)

            // 원시 데이터 찍기
            val store = HealthStoreProvider.getStore(activity.applicationContext)
            printHealthPreview(store)
        }
    }

    /** 헬스 데이터 프리뷰 로그 찍기 */
    private suspend fun printHealthPreview(store: HealthDataStore) {
        val TAG = "health data preview"

        // 걸음 수
        dataRepo.getSteps(store).forEach { item ->
            Log.d(TAG, "steps ${item.value}")
            Log.d(TAG, "steps ${item.startTime} ~ ${item.endTime}")
        }

        // 활동 요약
        dataRepo.getActivitySummary(store).forEach { item ->
            Log.d(TAG, "activities: ${item.value}")
        }

        // 수면 목표
        dataRepo.getSleepGoal(store).forEach { item ->
            Log.d(TAG, "수면 목표: ${item.value}")
        }

        // 수면 데이터
        dataRepo.getSleep(store).forEach { item ->
            val score = item.getValue(DataType.SleepType.SLEEP_SCORE)
            val duration = item.getValue(DataType.SleepType.DURATION)
            val sleepSession = item.getValue(DataType.SleepType.SESSIONS)

            Log.d(TAG, "**sleep session**")
            sleepSession?.forEach { session ->
                Log.d(TAG, "수면시간: ${formatDuration(session.duration)}")
                Log.d(TAG, "수면시작: ${session.startTime}")
                Log.d(TAG, "수면끝: ${session.endTime}")
            }

            Log.d(TAG, "score: $score")
            Log.d(TAG, "sleep duration: ${formatDuration(duration)}")
        }
    }

}