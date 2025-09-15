package com.ssafy.dgg.ui.screen

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue

/* 상태 직접 관리X, 요청을 외부에 전달 -> State Hoisting */
@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onSignUpClicked: () -> Unit,
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
        Text(
            text = "로그인",
            style = MaterialTheme.typography.headlineLarge,
            color = MaterialTheme.colorScheme.onBackground
        )
        Spacer(modifier = Modifier.height(32.dp))

        // 아이디 입력 필드
        OutlinedTextField(
            value = userId,
            onValueChange = { newText : String -> userId = newText },
            label = { Text("아이디를 입력하세요") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(16.dp))

        // 비밀번호 입력 필드
        OutlinedTextField(
            value = password,
            onValueChange = { newText : String -> password = newText },
            label = { Text("비밀번호를 입력하세요") },
            visualTransformation = PasswordVisualTransformation(), // 비밀번호를 *로 가립니다.
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(modifier = Modifier.height(24.dp))

        // 로그인 버튼
        Button(
            onClick = {
                // TODO: 여기에 실제 로그인 로직(예: API 호출)을 구현합니다.
                // 현재는 단순히 성공했다고 가정하고 onLoginSuccess 람다를 호출합니다.
                onLoginSuccess()
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("로그인")
        }
        Spacer(modifier = Modifier.height(8.dp))

        // 회원가입 버튼
        TextButton (
            onClick = onSignUpClicked,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("회원가입")
        }
        
        // google 로그인 버튼 추가
        Button(
            onClick = onGoogleSignInClicked
        ) { 
            Text("Google로 로그인")
        }
    }
}