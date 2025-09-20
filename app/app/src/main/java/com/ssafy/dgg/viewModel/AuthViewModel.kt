
import android.util.Log
import androidx.compose.runtime.mutableStateOf
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.ssafy.dgg.BuildConfig
import com.ssafy.dgg.model.data.GoogleLoginRequest
import com.ssafy.dgg.model.repository.RetrofitClient
import com.ssafy.dgg.model.repository.auth.AuthRepository
import com.ssafy.dgg.util.CookieSyncUtil
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

    // compose에서 관찰할 로그인 상태
    private val _loginState = mutableStateOf<LoginState>(LoginState.LoggedOut)
    var loginState = _loginState

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
                    val baseUrl = BuildConfig.WEB_URL
                    val host = baseUrl.toHttpUrl().host
                    val cookies = client.getCookies(host)

                    // cookie 심기: domain 단위로 붙음 -> web에 붙여주기
                    cookieSyncUtil.syncToWebView(BuildConfig.WEB_URL, cookies)
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

    fun logout() {
        // 기존처럼 tokenStorage 지울 필요 없음 (토큰 직접 안 씀) 대신 WebView 쿠키 삭제 처리
        val cookieManager = android.webkit.CookieManager.getInstance()
        cookieManager.removeAllCookies(null)
        cookieManager.flush()

        _loginState.value = LoginState.LoggedOut
        Log.d("LoginFlow", "로그아웃: 쿠키 삭제 완료")
    }
}
