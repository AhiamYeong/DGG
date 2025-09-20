package com.ssafy.dgg.viewModel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ssafy.dgg.model.repository.RetrofitClient
import kotlinx.coroutines.launch

class TestViewModel : ViewModel() {

    fun fetchPost(postId: Int) {
        viewModelScope.launch {
            try {
                // API 호출
/*                val post = RetrofitClient.testApiService.getPost(postId)
                // 성공시 로그 출력
                println("API 호출 성공: ${post.title}")*/
            } catch (e: Exception){
                // println("API 호출 실패: ${e.message}")
            }
        }
    }
}