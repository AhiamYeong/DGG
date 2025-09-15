package com.ssafy.dgg.viewModel

/* 로그인 상태 관리 */
sealed class LoginState {
    object LoggedOut: LoginState()
    object LoggedIn : LoginState()
}