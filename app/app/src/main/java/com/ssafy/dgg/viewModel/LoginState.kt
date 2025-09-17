package com.ssafy.dgg.viewModel

/* 로그인 상태 관리 */
sealed class LoginState {
    object LoggedOut: LoginState()
    object LoggedIn : LoginState()
    // 로딩, 예외 추가
    object Loading: LoginState()
    data class Error(val message: String) : LoginState()
}