package com.ssafy.dgg.model.repository.api

import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import com.ssafy.dgg.BuildConfig
import com.ssafy.dgg.model.repository.AuthApi
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import retrofit2.Retrofit

object RetrofitClient {
    private val json = Json { ignoreUnknownKeys = true }
    private val retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.WEB_URL)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()

    // 로그인용
    val authApiService: AuthApi by lazy {
        retrofit.create(AuthApi::class.java)
    }
}