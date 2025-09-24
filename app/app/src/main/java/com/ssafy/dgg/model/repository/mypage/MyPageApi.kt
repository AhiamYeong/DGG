package com.ssafy.dgg.model.repository.mypage

import com.ssafy.dgg.model.data.AlarmSettingsDTO
import com.ssafy.dgg.model.data.ProfileResponse
import com.ssafy.dgg.model.data.ProfileUpdateDTO
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH

/** 정보 조회/수정, 알림설정 조회/수정 */
interface MyPageApi {
    @GET("mypage/profile")
    suspend fun getProfile(): ProfileResponse

    @PATCH("mypage/profile")
    suspend fun updateProfile(@Body request: ProfileUpdateDTO): ProfileUpdateDTO

    @GET("mypage/alarm/settings")
    suspend fun getAlarmSettings(): AlarmSettingsDTO

    @PATCH("mypage/alarm/settings")
    suspend fun updateAlarmSettings(@Body request: AlarmSettingsDTO): AlarmSettingsDTO
}