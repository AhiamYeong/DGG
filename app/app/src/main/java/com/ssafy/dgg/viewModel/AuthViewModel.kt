
import android.util.Log
import androidx.compose.runtime.State
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ssafy.dgg.BuildConfig
import com.ssafy.dgg.model.data.GoogleLoginRequest
import com.ssafy.dgg.model.repository.RetrofitClient
import com.ssafy.dgg.model.repository.auth.AuthRepository
import com.ssafy.dgg.util.CookieSyncUtil
import com.ssafy.dgg.util.LoginUtil
import com.ssafy.dgg.viewModel.LoginState
import kotlinx.coroutines.launch
import okhttp3.HttpUrl.Companion.toHttpUrl

/*
* AccessToken만 전달 & Reissue를 전제로
* TODO: Refresh Token 로직 다시 확인
*/

class AuthViewModel(
    private val authRepository: AuthRepository
) : ViewModel() {

    private val client = RetrofitClient
    private val cookieSyncUtil = CookieSyncUtil

    // compose에서 관찰할 로그인 상태 -> 초기상태 확인
    private val _loginState = mutableStateOf<LoginState>(
        if (LoginUtil.isLoggedIn()) LoginState.LoggedIn else LoginState.LoggedOut
    )
    // 외부에 읽기 전용으로 공개
    val loginState: State<LoginState> = _loginState
    // 구글 로그인 ID token 처리 함수
    fun loginWithGoogle(idToken: String) {
        // 로그인 시도중임을 UI에 알리기
        _loginState.value = LoginState.Loading

        viewModelScope.launch {
            try {
                val request = GoogleLoginRequest(idToken = idToken)
                Log.d("LoginFlow", "viewModel Repository 호출 전 idToken=$idToken")
                val success = authRepository.loginWithGoogle(request)

                // cookieJar로 변경 (accesstoken intercept)
                if (success){
                    // cookie 받기: host 단위로 저장 (host만 꺼내기)
                    val cookies = client.getCookies(BuildConfig.WEB_URL.toHttpUrl().host)
                    // cookie 심기: domain 단위로 붙음 -> web에 붙여주기
                    val webUrl = BuildConfig.WEB_URL.toHttpUrl()
                    val apiUrl = BuildConfig.API_BASE_URL.toHttpUrl()

                    cookieSyncUtil.syncToWebView(webUrl.toString(), cookies)
                    cookieSyncUtil.syncToWebView(apiUrl.toString(), cookies)

                    _loginState.value = LoginState.LoggedIn
                    Log.d("LoginFlow", "쿠키 동기화 완료: $cookies")
                    Log.d("LoginFlow", "로그인 상태 변경: ${_loginState.value}")
                } else {
                    throw Exception("로그인 실패: 서버 응답 없음")
                }

            } catch (e: Exception) {
                _loginState.value = LoginState.Error(e.message ?: "로그인 실패")
                Log.e("LoginFlow", "로그인 실패", e)
            }
        }
    }

    suspend fun logout() {
        try {
            val success = authRepository.logout()
            if (success) {
                _loginState.value = LoginState.LoggedOut
            } else {
                _loginState.value = LoginState.Error("로그아웃 실패")
            }
            // 기존처럼 tokenStorage 지울 필요 없음 (토큰 직접 안 씀) 대신 WebView 쿠키 삭제 처리
            val cookieManager = android.webkit.CookieManager.getInstance()
            cookieManager.removeAllCookies {
                Log.d("LoginFlow", "WebView 쿠키 삭제 완료: $it")
            }
            cookieManager.flush()

            // RetrofitClient 쿠키 삭제
            client.clearCookies()

            // 상태 변경
            _loginState.value = LoginState.LoggedOut
            Log.d("LoginFlow", "로그아웃 완료 (WebView + RetrofitClient 쿠키 삭제)")

        } catch (e: Exception) {
            _loginState.value = LoginState.Error(e.message ?: "로그아웃 실패")
            Log.e("LoginFlow", "로그아웃 실패", e)
        }
    }

    // 테스트용 - 열어두기
    fun forceLogin() {
        _loginState.value = LoginState.LoggedIn
    }

    fun withdraw() {
        try {
            val success = authRepository.withdraw()
            if (success) {
                // 1. 쿠키 정리
                val cookieManager = android.webkit.CookieManager.getInstance()
                cookieManager.removeAllCookies {
                    Log.d("Auth", "WebView 쿠키 삭제 완료")
                }
                cookieManager.flush()
                client.clearCookies()

                // 2. 상태 초기화
                _loginState.value = LoginState.LoggedOut
                Log.d("Auth", "회원탈퇴 성공 → 로그아웃 처리 완료")
            } else {
                _loginState.value = LoginState.Error("회원탈퇴 실패")
            }
        } catch (e: Exception) {
            _loginState.value = LoginState.Error("회원탈퇴 예외 발생: ${e.message}")
        }
    }

}
