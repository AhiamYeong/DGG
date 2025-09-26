package com.ssafy.dgg.viewModel

import android.app.Activity
import android.content.Context
import android.util.Log
import androidx.core.content.edit
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
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch

/** 데이터 전송 함수 */
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

    // 10분마다 활동 데이터 전송
    fun startPeriodicActivitySync(activity: Activity){
        if (periodicJob?.isActive == true) return // 이미 실행중이면 무시

        periodicJob = viewModelScope.launch {
            while (isActive) {
                sendActivityData(activity)
                delay(10 * 60 * 1000L) // 10분
            }
        }
    }

    // 중단
    fun stopPeriodicSync() {
        periodicJob?.cancel()
    }

    // 데이터 전송
    fun sendSleepAndStepsData(activity: Activity) {
        viewModelScope.launch {
            val prefs = activity.getSharedPreferences("sleep_prefs", Context.MODE_PRIVATE)
            val today = java.time.LocalDate.now(java.time.ZoneOffset.UTC).toString()
            val lastSent = prefs.getString("last_sent_date", null)

            // 실제 수면 데이터 가져오기
            val store = HealthStoreProvider.getStore(activity.applicationContext)
            val sleepAndStepsDTO = dataRepo.getSleepAndStepsDataResponse(store)
            Log.d("DTO", "$sleepAndStepsDTO")

            if (lastSent == today) {
                Log.d("Sleep", "이미 오늘 전송됨 → skip")
                _sleepStatus.value = "오늘은 이미 전송됨"
                return@launch
            }

            // 서버 전송
            val success = healthRepo.sendSleepAndStepsData(sleepAndStepsDTO)
            if (success) {
                // 성공하면 오늘 날짜 기록
                prefs.edit { putString("last_sent_date", today) }
            }
            _sleepStatus.value = if (success) "수면 데이터 전송 성공" else "수면 데이터 전송 실패"
        }
    }
    
    fun sendActivityData(activity: Activity){
        viewModelScope.launch {
            val store = HealthStoreProvider.getStore(activity.applicationContext)
            val activityDTO = dataRepo.getHealthDataResponse(store)
            Log.d("DTO", "$activityDTO")
            val success = healthRepo.sendActivityData(activityDTO)
            _activityStatus.value = if (success) "활동 데이터 전송 성공" else "활동 데이터 전송 실패"
        }
    }

    fun loadHealthData(activity: Activity) {
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

            // 최초 실행시: 수면 전송
            sendSleepAndStepsData(activity)
            // sendActivityData(activity)

            // 원시 데이터 찍기
            // val store = HealthStoreProvider.getStore(activity.applicationContext)
            // printHealthPreview(store)
        }
    }

    /** 헬스 데이터 프리뷰 로그 찍기 (디버그용) */
    private suspend fun printHealthPreview(store: HealthDataStore) {
        val TAG = "healthPreview"

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