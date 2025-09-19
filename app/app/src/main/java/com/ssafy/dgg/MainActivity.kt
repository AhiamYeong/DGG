package com.ssafy.dgg

import LoginViewModel
import android.Manifest
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import com.google.firebase.ktx.Firebase
import com.google.firebase.messaging.ktx.messaging
import com.ssafy.dgg.auth.GoogleSignInManager
import com.ssafy.dgg.auth.TokenStorage
import com.ssafy.dgg.model.repository.AuthRepositoryImpl
import com.ssafy.dgg.model.repository.api.HealthDataRepository
import com.ssafy.dgg.model.repository.api.HealthPermissionRepository
import com.ssafy.dgg.model.repository.api.RetrofitClient
import com.ssafy.dgg.ui.screen.LoginScreen
import com.ssafy.dgg.ui.screen.MainScreen
import com.ssafy.dgg.ui.theme.DGGTheme
import com.ssafy.dgg.util.HealthStoreProvider
import com.ssafy.dgg.viewModel.HealthViewModel
import com.ssafy.dgg.viewModel.LoginState


class MainActivity : ComponentActivity() {

    // FCM 런타임 권한 요청
    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission(),
    ) { isGranted: Boolean ->
        if (isGranted) {
            // FCM SDK (and your app) can post notifications.
            Toast.makeText(this, "알림 권한이 허용되었습니다.", Toast.LENGTH_SHORT).show()
        } else {
            // TODO: Inform user that that your app will not show notifications.
            Toast.makeText(this, "알림 권한이 거부되었습니다.", Toast.LENGTH_SHORT).show()
        }
    }

    private fun askNotificationPermission() {
        // This is only necessary for API level >= 33 (TIRAMISU)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
                PackageManager.PERMISSION_GRANTED
            ) {
                // FCM SDK (and your app) can post notifications.
            } else if (shouldShowRequestPermissionRationale(Manifest.permission.POST_NOTIFICATIONS)) {
                // TODO: display an educational UI explaining to the user the features that will be enabled
                //       by them granting the POST_NOTIFICATION permission. This UI should provide the user
                //       "OK" and "No thanks" buttons. If the user selects "OK," directly request the permission.
                //       If the user selects "No thanks," allow the user to continue without notifications.
            } else {
                // Directly ask for the permission
                requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS)
            }
        }
    }

    val TAG = "FCM"
    private fun logRegToken() {
        // [START log_reg_token]
        Firebase.messaging.getToken().addOnCompleteListener { task ->
            if (!task.isSuccessful) {
                Log.w(TAG, "Fetching FCM registration token failed", task.exception)
                return@addOnCompleteListener
            }

            // Get new FCM registration token
            val token = task.result

            // Log and toast
            val msg = "FCM Registration token: $token"
            Log.d(TAG, msg)
            Toast.makeText(baseContext, msg, Toast.LENGTH_SHORT).show()
        }
        // [END log_reg_token]
    }

    // 삼성헬스 ViewModel 호출
    private val healthViewModel: HealthViewModel by lazy {
        val store = HealthStoreProvider.getStore(applicationContext)
        val permissionRepo = HealthPermissionRepository(store)
        val dataRepo = HealthDataRepository(store)

        // 마지막 줄이 HealthViewModel 객체를 반환하도록 함
        HealthViewModel(permissionRepo, dataRepo)
    }

    private lateinit var googleSignInManager: GoogleSignInManager

    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)

        // 로그인 토큰 저장용 앱 내 스토리지
        val tokenStorage = TokenStorage(this)
        val authRepository = AuthRepositoryImpl(
            authApi = RetrofitClient.authApiService,
        )
        // UI ~ 비즈니스 로직 연결 -> compose UI가 viewmodel의 loginState를 관찰
        val loginViewModel = LoginViewModel(tokenStorage, authRepository)
        healthViewModel.loadHealthDatas(this)

        askNotificationPermission()
        // logRegToken()

        // googlesigninmanager 초기화
        googleSignInManager = GoogleSignInManager(
            this,
            onSignInSuccess = { idToken ->
                Log.d("LoginFlow", "ID token 획득: $idToken")
                loginViewModel.loginWithGoogle(idToken)
            },
            onSignInFailure = { exception ->
                Log.e("LoginFlow", "로그인 실패", exception)
            }
        )

/*        setContent {
            DGGTheme {
                Surface (
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ){
                    MainScreen()
                }
            } // DGGTheme
        } // setContent*/

        setContent {
            // 로그인 상태 관리 변수
            var loginState by remember { mutableStateOf<LoginState>(LoginState.LoggedOut) }

            DGGTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    when (loginState) {
                        is LoginState.LoggedOut -> {
                            LoginScreen(
                                onLoginSuccess = { loginState = LoginState.LoggedIn },
                                // onSignUpClicked = { loginState = LoginState.LoggedIn },
                                onGoogleSignInClicked = { googleSignInManager.startSignInIntent() }
                            )
                        }
                        is LoginState.LoggedIn -> {
                            MainScreen()
                        }

                        is LoginState.Loading -> {
                            CircularProgressIndicator()
                        }

                        is LoginState.Error -> {
                            Text("에러 발생")
                        }

                    }
                }
            }
        }
    }
}

@Composable
fun WebViewScreen(
    url: String,
    modifier: Modifier = Modifier
) {
    var isLoading by remember { mutableStateOf(true) }

    Box(
        modifier = modifier.fillMaxSize()
    ) {
        AndroidView(
            factory = { context ->
                WebView(context).apply {
                    settings.javaScriptEnabled = true
                    settings.domStorageEnabled = true
                    settings.loadWithOverviewMode = true
                    settings.useWideViewPort = true

                    webViewClient = object : WebViewClient() {
                        override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                            isLoading = true
                        }

                        override fun onPageFinished(view: WebView?, url: String?) {
                            isLoading = false
                        }
                    }
                }
            },
        )
    }
}


    /* companion object {
        private const val TAG = "MainActivity"
    }*/


    /*@Composable
    fun WebViewScreen(
        url: String,
        modifier: Modifier = Modifier
    ) {
        var isLoading by remember { mutableStateOf(true) }

        Box(
            modifier = modifier.fillMaxSize()
        ) {
            AndroidView(
                factory = { context ->
                    WebView(context).apply {
                        settings.javaScriptEnabled = true
                        settings.domStorageEnabled = true
                        settings.loadWithOverviewMode = true
                        settings.useWideViewPort = true

                        webViewClient = object : WebViewClient() {
                            override fun onPageStarted(
                                view: WebView?,
                                url: String?,
                                favicon: Bitmap?
                            ) {
                                isLoading = true
                            }

                            override fun onPageFinished(view: WebView?, url: String?) {
                                isLoading = false
                            }
                        }
                    }
                },
                update = { webView ->
                    webView.loadUrl(url)
                }
            )

            // 로딩 중일 때 프로그레스 표시
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.Center)
                )
            }
        }
    }*/