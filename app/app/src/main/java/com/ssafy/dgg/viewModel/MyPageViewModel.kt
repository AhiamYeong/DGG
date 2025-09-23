package com.ssafy.dgg.viewModel

import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ssafy.dgg.model.data.AlarmSettingsDTO
import com.ssafy.dgg.model.data.ProfileResponse
import com.ssafy.dgg.model.data.ProfileUpdateDTO
import com.ssafy.dgg.model.repository.mypage.MyPageRepository
import kotlinx.coroutines.launch

class MyPageViewModel(
    private val MyPageRepository: MyPageRepository
) : ViewModel() {
    private val _profile = mutableStateOf<ProfileResponse?>(null)
    val profile: State<ProfileResponse?> = _profile

    private val _alarmSettings = mutableStateOf<AlarmSettingsDTO?>(null)
    val alarmSettings: State<AlarmSettingsDTO?> = _alarmSettings

    private val _loading = mutableStateOf(false)
    val loading: State<Boolean?> = _loading

    private val _error = mutableStateOf<String?>(null)
    val error: State<String?> = _error

    // viewmodel 생성시 불러오기
    init {
        fetchProfile()
        fetchAlarmSettings()
    }

    // 프로필 받아오기
    fun fetchProfile(){
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = MyPageRepository.getProfile()
                _profile.value = result
                _error.value = null
            } catch (e: Exception) {
                _error.value = e.message
            } finally {
                _loading.value = false
            }
        }
    }

    // 닉네임 수정
    fun updateNickname(newNickname: String) {
        viewModelScope.launch {
            try {
                MyPageRepository.updateProfile(ProfileUpdateDTO(newNickname))
                // PATCH 응답은 nickname만 있어서 바로 반영 못 함
                fetchProfile() // 다시 GET 호출해서 email 포함 최신 데이터 갱신
            } catch (e: Exception) {
                _error.value = e.message
            }
        }
    }

    // 알림 받아오기
    fun fetchAlarmSettings() {
        viewModelScope.launch {
            try {
                _alarmSettings.value = MyPageRepository.getAlarmSettings()
            } catch (e: Exception) {
                _error.value = e.message
            }
        }
    }

    fun updateAlarmSettings(newSettings: AlarmSettingsDTO) {
        viewModelScope.launch {
            try {
                _alarmSettings.value = MyPageRepository.updateAlarmSettings(newSettings)
            } catch (e: Exception) {
                _error.value = e.message
            }
        }
    }
}