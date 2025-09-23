package com.ssafy.dgg.model.repository.mypage

import com.ssafy.dgg.model.data.AlarmSettingsDTO
import com.ssafy.dgg.model.data.ProfileResponse
import com.ssafy.dgg.model.data.ProfileUpdateDTO

class MyPageRepositoryImpl (
    private val myPageApi: MyPageApi
): MyPageRepository {
    override suspend fun getProfile(): ProfileResponse {
        return try {
            myPageApi.getProfile()
        } catch (e: Exception) {
            throw Exception("프로필 조회 실패: ${e.message}")
        }
    }

    override suspend fun updateProfile(request: ProfileUpdateDTO): ProfileUpdateDTO {
        return try {
            myPageApi.updateProfile(request = request)
        } catch (e: Exception) {
            throw Exception("프로필 수정 실패: ${e.message}")
        }
    }

    override suspend fun getAlarmSettings(): AlarmSettingsDTO {
        return try {
            myPageApi.getAlarmSettings()
        } catch (e: Exception) {
            throw Exception("알람 설정 조회 실패: ${e.message}")
        }
    }

    override suspend fun updateAlarmSettings(request: AlarmSettingsDTO): AlarmSettingsDTO {
        return try {
            myPageApi.updateAlarmSettings(request = request)
        } catch (e: Exception) {
            throw Exception("알람 설정 수정 실패: ${e.message}")
        }
    }
}