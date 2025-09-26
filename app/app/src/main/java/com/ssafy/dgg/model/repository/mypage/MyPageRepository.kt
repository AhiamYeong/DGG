package com.ssafy.dgg.model.repository.mypage

import com.ssafy.dgg.model.data.AlarmSettingsDTO
import com.ssafy.dgg.model.data.ProfileResponse
import com.ssafy.dgg.model.data.ProfileUpdateDTO

interface MyPageRepository {
    suspend fun getProfile(): ProfileResponse
    suspend fun updateProfile(request: ProfileUpdateDTO): ProfileUpdateDTO
    suspend fun getAlarmSettings(): AlarmSettingsDTO
    suspend fun updateAlarmSettings(request: AlarmSettingsDTO): AlarmSettingsDTO
}