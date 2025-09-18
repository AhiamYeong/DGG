package com.ssafy.dgg.viewModel

import android.app.Activity
import android.util.Log
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.samsung.android.sdk.health.data.data.AggregatedData
import com.ssafy.dgg.model.repository.api.HealthDataRepository
import com.ssafy.dgg.model.repository.api.HealthPermissionRepository
import kotlinx.coroutines.launch
import java.time.LocalDate
class HealthViewModel(
    private val permissionRepo: HealthPermissionRepository,
    private val dataRepo: HealthDataRepository
) : ViewModel() {

    // private set을 통해 외부에서는 값을 변경하지 못하도록 보호
    private val _steps = MutableLiveData<List<AggregatedData<Long>>>()

    // public get을 통해 외부에서 값에 접근
    val steps: LiveData<List<AggregatedData<Long>>>
        get() = _steps

    fun loadStepsData(activity: Activity) {
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

            // 3. 여기까지 왔으면 권한 있는 상태 → 데이터 불러오기
            _steps.value = dataRepo.getSteps(LocalDate.now()).also {
                Log.d("Health", "steps 데이터가 변경됨: $it")
            }
        }
    }

}