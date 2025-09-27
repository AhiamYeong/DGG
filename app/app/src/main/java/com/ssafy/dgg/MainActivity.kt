package com.ssafy.dgg

import AuthViewModel
import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.core.content.ContextCompat
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import com.google.firebase.ktx.Firebase
import com.google.firebase.messaging.ktx.messaging
import com.ssafy.dgg.auth.GoogleSignInManager
import com.ssafy.dgg.model.repository.RetrofitClient
import com.ssafy.dgg.model.repository.auth.AuthRepositoryImpl
import com.ssafy.dgg.model.repository.health.HealthDataRepository
import com.ssafy.dgg.model.repository.health.HealthPermissionRepository
import com.ssafy.dgg.model.repository.health.HealthRepositoryImpl
import com.ssafy.dgg.service.MyNavigationService
import com.ssafy.dgg.ui.screen.LoginScreen
import com.ssafy.dgg.ui.screen.NavigationScreen
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
        val healthRepo = HealthRepositoryImpl(
            healthApi = RetrofitClient.healthApiService
        )

        // 마지막 줄이 HealthViewModel 객체를 반환하도록 함
        HealthViewModel(permissionRepo, dataRepo, healthRepo)
    }

    private val requestLocationPermission =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            if (granted) {
                Log.d("MainActivity", "위치 권한 허용됨")
                // 여기서 바로 서비스 시작 가능
                val intent = Intent(this, MyNavigationService::class.java)
                ContextCompat.startForegroundService(this, intent)
            } else {
                Log.d("MainActivity", "위치 권한 거부됨")
            }
        }


    private lateinit var googleSignInManager: GoogleSignInManager

    override fun onCreate(savedInstanceState: Bundle?) {

        super.onCreate(savedInstanceState)

        val authRepository = AuthRepositoryImpl(
            authApi = RetrofitClient.authApiService,
        )
        val healthRepository = HealthRepositoryImpl(
            healthApi = RetrofitClient.healthApiService
        )
        // UI ~ 비즈니스 로직 연결 -> compose UI가 viewmodel의 loginState를 관찰
        val authViewModel = AuthViewModel(authRepository)

        if (ContextCompat.checkSelfPermission(
                this, Manifest.permission.ACCESS_FINE_LOCATION)
            != PackageManager.PERMISSION_GRANTED) {
            requestLocationPermission.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        } else {
            // 이미 권한 있음 → 서비스 실행
            val intent = Intent(this, MyNavigationService::class.java)
            ContextCompat.startForegroundService(this, intent)
        }


        askNotificationPermission()
        // logRegToken()

        // googlesigninmanager 초기화
        googleSignInManager = GoogleSignInManager(
            this,
            onSignInSuccess = { idToken ->
                Log.d("LoginFlow", "ID token 획득: $idToken")
                authViewModel.loginWithGoogle(idToken)
            },
            onSignInFailure = { exception ->
                Log.e("LoginFlow", "로그인 실패", exception)
            }
        )

        setContent {
            // authViewModel 값만 위임해 참조
            val loginState by authViewModel.loginState

            DGGTheme {
                Surface (
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ){
                    when (loginState) {
                        is LoginState.LoggedOut -> {
                            LoginScreen(
                                onLoginSuccess = { authViewModel.forceLogin() },
                                // onSignUpClicked = { loginState = LoginState.LoggedIn },
                                onGoogleSignInClicked = { googleSignInManager.startSignInIntent() }
                            )
                        }
                        is LoginState.LoggedIn -> {
                            NavigationScreen()
                            // MainScreen(authViewModel)
                            // 수면 데이터는 최초 실행
                            healthViewModel.loadHealthData(this)

                            // 활동 데이터는 10분마다 반복
                            healthViewModel.startPeriodicActivitySync(this)

                            // activity 중단시 반복 멈추기
                            lifecycle.addObserver(object : DefaultLifecycleObserver {
                                // 앱이 백그라운드 가면 반복 멈추기
                                override fun onStop(owner: LifecycleOwner) {
                                    healthViewModel.stopPeriodicSync()
                                }
                            })

                            // 빌드시에만 toast 띄우기
                            healthViewModel.activityStatus.observe(this) { status ->
                                if (BuildConfig.DEBUG) Toast.makeText(this, status, Toast.LENGTH_SHORT).show()
                            }

                            healthViewModel.sleepStatus.observe(this) { status ->
                                if (BuildConfig.DEBUG) Toast.makeText(this, status, Toast.LENGTH_SHORT).show()
                            }
                        }

                        is LoginState.Loading -> {
                            CircularProgressIndicator()
                        }

                        is LoginState.Error -> {
                            Text("에러 발생")
                        }

                    }
                    // MainScreen()
                }
            } // DGGTheme
        } // setContent
    }
}