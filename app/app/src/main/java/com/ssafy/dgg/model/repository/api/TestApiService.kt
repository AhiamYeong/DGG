package com.ssafy.dgg.model.repository.api

import com.ssafy.dgg.model.data.dto.PostDTO
import retrofit2.http.GET
import retrofit2.http.Path

interface TestApiService {
    @GET("posts/{id}")
    suspend fun getPost(@Path("id") postId: Int): PostDTO
}