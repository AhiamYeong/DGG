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

// 목업 데이터
// 더미 데이터 정의
val mockProfile = ProfileResponse(
    nickname = "테스트유저",
    email = "test@example.com"
)

val mockProfileUpdate = ProfileUpdateDTO(
    nickname = "테스트바꿔바꿔"
)

val mockAlarmSettings = AlarmSettingsDTO(
    generalEnabled = true,
    sleepEnabled = false
)

val mockNewAlarmSettings = AlarmSettingsDTO(
    generalEnabled = false,
    sleepEnabled = true
)

class MyPageRepositoryMock : MyPageRepository {
    override suspend fun getProfile(): ProfileResponse {
        return mockProfile
    }

    override suspend fun updateProfile(request: ProfileUpdateDTO): ProfileUpdateDTO {
        return mockProfileUpdate.copy(nickname = request.nickname)
    }

    override suspend fun getAlarmSettings(): AlarmSettingsDTO {
        return mockAlarmSettings
    }

    override suspend fun updateAlarmSettings(request: AlarmSettingsDTO): AlarmSettingsDTO {
        return mockNewAlarmSettings
    }
}


class MyPageViewModel(
    private val myPageRepository: MyPageRepository
) : ViewModel() {
    private val _profile = mutableStateOf<ProfileResponse?>(null)
    val profile: State<ProfileResponse?> = _profile

    private val _alarmSettings = mutableStateOf<AlarmSettingsDTO?>(null)
    val alarmSettings: State<AlarmSettingsDTO?> = _alarmSettings

    // 수정 중 닉네임 (TextField 바인딩용)
    private val _tempNickname = mutableStateOf("")
    val tempNickname: State<String> = _tempNickname

    // 수정 중 알람 세팅 (토글 바인딩용)
    private val _tempAlarmSettings = mutableStateOf<AlarmSettingsDTO?>(null)
    val tempAlarmSettings: State<AlarmSettingsDTO?> = _tempAlarmSettings



    private val _loading = mutableStateOf(false)
    val loading: State<Boolean?> = _loading

    private val _error = mutableStateOf<String?>(null)
    val error: State<String?> = _error

    // viewmodel 생성시 불러오기
    init {
        fetchProfile()
        fetchAlarmSettings()
    }

    // TextField에서 입력 바뀔 때 호출
    fun onNicknameChange(newNickname: String) {
        _tempNickname.value = newNickname
    }

    // 저장 버튼 → 서버에 PATCH 요청
    fun saveNickname() {
        viewModelScope.launch {
            _profile.value?.let {
                myPageRepository.updateProfile(ProfileUpdateDTO(_tempNickname.value))
                fetchProfile() // 최신 데이터 다시 받아오기
            }
        }
    }

    // 취소 버튼 → 원래 값으로 복구
    fun cancelEdit() {
        _profile.value?.let {
            _tempNickname.value = it.nickname
        }
    }

    // 토글 시 임시 상태만 변경
    fun onAlarmToggle(enabled: Boolean) {
        val current = _tempAlarmSettings.value ?: _alarmSettings.value
        _tempAlarmSettings.value = current?.copy(generalEnabled = enabled)
            ?: AlarmSettingsDTO(enabled, false) // 기본값
    }

    // 저장 버튼 → 서버에 PATCH 요청
    fun saveAlarmSettings() {
        viewModelScope.launch {
            try {
                val dto = _tempAlarmSettings.value ?: return@launch
                myPageRepository.updateAlarmSettings(dto)   // PATCH 요청
                _alarmSettings.value = dto                  // 성공하면 반영
                _tempAlarmSettings.value = null             // 임시 상태 초기화
            } catch (e: Exception) {
                _error.value = e.message
            }
        }
    }

    // 취소 버튼 → 원래 값으로 복구
    fun cancelAlarmSettings() {
        _alarmSettings.value?.let {
            _tempAlarmSettings.value = it
        }
    }

    // 프로필 받아오기
    fun fetchProfile(){
        viewModelScope.launch {
            _loading.value = true
            try {
                val result = myPageRepository.getProfile()
                _profile.value = result
                _tempNickname.value = result.nickname
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
                myPageRepository.updateProfile(ProfileUpdateDTO(newNickname))
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
                _alarmSettings.value = myPageRepository.getAlarmSettings()
            } catch (e: Exception) {
                _error.value = e.message
            }
        }
    }

    fun updateAlarmSettings(newSettings: AlarmSettingsDTO) {
        viewModelScope.launch {
            try {
                _alarmSettings.value = myPageRepository.updateAlarmSettings(newSettings)
            } catch (e: Exception) {
                _error.value = e.message
            }
        }
    }
}