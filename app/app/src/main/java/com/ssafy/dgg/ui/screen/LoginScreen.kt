package com.ssafy.dgg.ui.screen

import android.util.Log
import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.ssafy.dgg.R

/* 상태 직접 관리X, 요청을 외부에 전달 -> State Hoisting
* 버튼 -> googlesigninmanager.signinIntent 실행
* 결과(Activity result)에서 account.idToken추출 -> viewmodel에 전달
* isLoggedIn에 따라 로그인 <> 메인화면 전달
*
* 인증 실패/로그아웃 플로우
* 로그아웃 : viewmodel -> tokenstorage.clearToken() -> isloggedin = false
* 401: tokeninterceptor에서 감지 -> 자동 로그아웃 or refresh token 플로우 추가
* */
@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    // onSignUpClicked: () -> Unit,
    onGoogleSignInClicked: () -> Unit,
){
    // 사용자가 입력한 아이디와 비밀번호를 상태로 관리
    var userId by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }

    Column (
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // 랜딩페이지 로고 추가하기
        Text(
            text = "덜낑김",
            fontSize = 36.sp,             // 크게!
            fontWeight = FontWeight.Bold, // 두껍게
            color = MaterialTheme.colorScheme.primary, // 브랜드 컬러 적용 가능
            modifier = Modifier.padding(bottom = 24.dp)
        )
        Image(
            painter = painterResource(id = R.drawable.dgg_icon), // logo.png 넣은 파일명
            contentDescription = "앱 로고",
            modifier = Modifier
                .padding(bottom = 24.dp)
                .size(120.dp) // 원하는 크기로 조절
        )
        // hotfix: 구글 로그인 -> 일반 로그인으로 변경
        // google 로그인 버튼 추가
        Button(
//            onClick = onGoogleSignInClicked
            onClick = { onLoginSuccess() }
        ) {
            Log.d("LoginFlow", "forceLogin")
            Text("Google로 로그인")
        }
    }
}
