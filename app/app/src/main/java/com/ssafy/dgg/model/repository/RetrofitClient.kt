package com.ssafy.dgg.model.repository

import android.util.Log
import com.jakewharton.retrofit2.converter.kotlinx.serialization.asConverterFactory
import com.ssafy.dgg.BuildConfig
import com.ssafy.dgg.model.repository.auth.AuthApi
import com.ssafy.dgg.model.repository.health.HealthApi
import com.ssafy.dgg.model.repository.mypage.MyPageApi
import kotlinx.serialization.json.Json
import okhttp3.Cookie
import okhttp3.CookieJar
import okhttp3.HttpUrl
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit

object RetrofitClient {
    private val json = Json { ignoreUnknownKeys = true }

    // Logging Interceptor 추가
    private val logging = HttpLoggingInterceptor { message ->
        Log.d("OkHttp", message)
    }.apply {
        level = HttpLoggingInterceptor.Level.BODY
    }

    private val cookieStore = mutableMapOf<String, List<Cookie>>()

    // 쿠키 직접 주입
    val cookieForceInterceptor = Interceptor { chain ->
        val request = chain.request()
        val host = request.url.host
        val cookies = RetrofitClient.getCookies(host)

        val newRequest = if (!cookies.isNullOrEmpty()) {
            val cookieHeader = cookies.joinToString("; ") { "${it.name}=${it.value}" }
            Log.d("CookieForce", "➡️ Forced Cookie Header: $cookieHeader")

            request.newBuilder()
                .addHeader("Cookie", cookieHeader)
                .build()
        } else {
            request
        }

        chain.proceed(newRequest)
    }

    // 쿠키 디버그
    val cookieDebugInterceptor = Interceptor { chain ->
        val request = chain.request()
        Log.d("CookieDebug", "➡️ Request URL: ${request.url}")
        request.headers.forEach { header ->
            Log.d("CookieDebug", "${header.first}: ${header.second}")
        }
        chain.proceed(request)
    }

    // cookieJar로 쿠키 받기
    private val client = OkHttpClient.Builder()
        .addInterceptor(logging)
        .addInterceptor(cookieDebugInterceptor)
        .addInterceptor(cookieForceInterceptor)  // 👈 강제 쿠키 삽입
        .cookieJar(object : CookieJar {

            // 서버 응답에서 Set-Cookie 헤더가 오면 자동 호출됨
            override fun saveFromResponse(url: HttpUrl, cookies: List<Cookie>) {
                cookieStore[url.host] = cookies
                Log.d("CookieCheck", "Saved cookies for ${url.host}: $cookies")

            }

            // 요청 보낼 때 저장된 쿠키를 꺼내서 자동으로 붙임
            override fun loadForRequest(url: HttpUrl): List<Cookie> {
                val cookies = cookieStore[url.host] ?: emptyList()
                Log.d("CookieCheck", "Load cookies for ${url.host}: $cookies → Request=$url")
                return cookies
            }
        })
        .build()

    private val retrofit = Retrofit.Builder()
        .baseUrl(BuildConfig.API_BASE_URL)
        .client(client)
        .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
        .build()

    fun getCookies(host: String): List<Cookie>? = cookieStore[host]

    fun clearCookies() {
        cookieStore.clear()
    }

    val authApiService: AuthApi by lazy {
        retrofit.create(AuthApi::class.java)
    }

    val healthApiService: HealthApi by lazy {
        retrofit.create(HealthApi::class.java)
    }

    val myPageApiService: MyPageApi by lazy {
        retrofit.create(MyPageApi::class.java)
    }
}