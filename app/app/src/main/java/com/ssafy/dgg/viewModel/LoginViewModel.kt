import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ssafy.dgg.auth.TokenStorage
import com.ssafy.dgg.model.repository.AuthRepository
import com.ssafy.dgg.viewModel.LoginState
import kotlinx.coroutines.launch

/*
* AccessToken만 전달 & Reissue를 전제로
* TODO: Refresh Token 로직 다시 확인
* */
class LoginViewModel(
    private val tokenStorage: TokenStorage, // 토큰 저장소
    private val authRepository: AuthRepository // 서버 통신 담당
) : ViewModel() {

    // compose에서 관찰할 로그인 상태
    private val _loginState = mutableStateOf<LoginState>(LoginState.LoggedOut)
    var loginState = _loginState

    // 구글 로그인 ID token 처리 함수
    // - googlesigninManager에서 추출한 id token 전달
    // - 서버 없으므로, 임시로 delay + dummy 토큰 사용
    fun loginWithGoogle(idToken: String) {
        // 로그인 시도중임을 UI에 알리기
        _loginState.value = LoginState.Loading

        viewModelScope.launch {
            try {
                // 서버에 ID Token 전달 → Access/Refresh Token 발급
                val tokens = authRepository.loginWithGoogle(idToken)

                // 토큰 저장: access Token만 발급 기준 & 추후 reissue를 염두
                tokenStorage.saveAccessToken(tokens.accessToken)

                // 상태 업데이트
                _loginState.value = LoginState.LoggedIn

            } catch (e: Exception) {
                _loginState.value = LoginState.Error(e.message ?: "로그인 실패")
            }
        }
    }

    fun logout() {
        tokenStorage.clearTokens()
        _loginState.value = LoginState.LoggedOut
    }
}
