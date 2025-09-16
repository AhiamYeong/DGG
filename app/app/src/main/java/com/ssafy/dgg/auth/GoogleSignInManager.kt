package com.ssafy.dgg.auth

import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResultCaller
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.result.registerForActivityResult
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.api.ApiException
import com.ssafy.dgg.BuildConfig

/* 구글 로그인에 필요한 모든 로직 추가 */
class GoogleSignInManager(
    activityResultCaller: ActivityResultCaller,
    private val onSignInSuccess : (idToken: String) -> Unit,
    private val onSignInFailure : (Exception) -> Unit,
) {
/*    val googleIdOption: GetGoogleIdOption = GetGoogleIdOption.Builder()
        .setFilterByAuthorizedAccounts(true)
        .setServerClientId(WEB_CLIENT_ID)
        .setAutoSelectEnabled(true) // 재방문시 자동로그인
        // nonce string to use when generating a Google ID token
        .setNonce(nonce = null) // 보안 강화 & 재생 공격 방지
        .build()*/


    // DEFAULT_SIGN_IN: 기본 정보 (이름, 이메일 등)
    // TODO: 우리 서비스에서 받는 정보 (닉네임, 이메일 2가지) 로 변경 필요??
    // 1. google sign in client로 네이티브 로그인 -> UI에서만 실행
    private val googleSignInClient by lazy {
        val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
            .requestIdToken(BuildConfig.GOOGLE_CLIENT_ID) // 서버에서 사용자 인증시 사용할 ID 토큰
            .requestEmail()
            .build()
        // TODO: deprecated 수정
        // 실제 로그인 요청 수행할 클라이언트 객체 생성 -
        GoogleSignIn.getClient(activityResultCaller as ComponentActivity, gso)
    }

    // 2. 로그인 결과 받을 activityresultlauncher 생성
    // google 로그인은 앱 activity가 하나고 뭐고 관계없이 새 액티비티를 열어야 한다더라
    // Activity Result API :
    // TODO: deprecated 대체
    private val signInLauncher = activityResultCaller.registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
        Log.d("GoogleSignIn", "Intent data: ${result.data}")
        try {
            val account = task.getResult(ApiException::class.java)
            // 로그인 성공 시 onSignInSuccess 콜백 호출
            account.idToken?.let { onSignInSuccess(it) }
        } catch (e: ApiException) {
            // 로그인 실패 시 onSignInFailure 콜백 호출
            onSignInFailure(e)
        }
    }

    // 3. 외부에 노출될 로그인 시작 함수 -> 실제 로그인 띄울 트리거 함수
    // 구글 액티비티 열어주세요... 요청서
    fun startSignInIntent() {
        val signInIntent = googleSignInClient.signInIntent
        signInLauncher.launch(signInIntent)
    }
}