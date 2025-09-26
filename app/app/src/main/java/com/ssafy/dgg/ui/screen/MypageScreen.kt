package com.ssafy.dgg.ui.screen

import AuthViewModel
import android.app.Activity
import android.webkit.WebView
import android.widget.Toast
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.ssafy.dgg.model.repository.RetrofitClient
import com.ssafy.dgg.viewModel.MyPageViewModel
import kotlinx.coroutines.launch
import com.ssafy.dgg.R

@Composable
fun MyPageScreen(
    modifier: Modifier = Modifier,
    authViewModel: AuthViewModel,
    onProfileUpdated: () -> Unit
) {
//     val loginState by viewModel.loginState
    val myPageRepo = _root_ide_package_.com.ssafy.dgg.model.repository.mypage.MyPageRepositoryImpl(RetrofitClient.myPageApiService)
    // val myPageRepo = remember { MyPageRepositoryMock() }
    val myPageViewModel = remember { MyPageViewModel(myPageRepo) }

    val profile = myPageViewModel.profile.value
    val alarmSettings = myPageViewModel.alarmSettings.value

    val tempNickname = myPageViewModel.tempNickname.value
    val tempAlarmSettings = myPageViewModel.tempAlarmSettings.value

    val loading = myPageViewModel.loading.value
    val error = myPageViewModel.error.value

    Column (
        modifier = modifier
            .fillMaxSize()
            .background(Color.White)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(32.dp)
    ) {
        if (loading == true) {
            Text("로딩 중...")
        } else if (error != null) {
            Text("에러: $error")
        } else if (profile != null) {
            ProfileEditScreen(
                nickname = tempNickname,
                email = profile.email,
                onNicknameChange = { myPageViewModel.onNicknameChange(it)},
                onSave = {
                    myPageViewModel.saveNickname()
                    onProfileUpdated()
                 },
                onCancel = { myPageViewModel.cancelEdit() },
                onWithdraw = { authViewModel.withdraw() },
                onLogout = { authViewModel.logout() }
            )
        }
        if (alarmSettings != null) {
            val alarmSettings = myPageViewModel.alarmSettings.value
            val tempAlarmSettings = myPageViewModel.tempAlarmSettings.value

            AlarmSettingScreen(
                isAlarmEnabled = tempAlarmSettings?.generalEnabled
                    ?: alarmSettings?.generalEnabled
                    ?: false,
                onAlarmToggle = { enabled -> myPageViewModel.onAlarmToggle(enabled) },
                onSave = { myPageViewModel.saveAlarmSettings() },
                onCancel = { myPageViewModel.cancelAlarmSettings() },
            )
        }
    }
}

@Composable
fun ProfileEditScreen(
    nickname: String,
    email: String,
    onNicknameChange: (String) -> Unit,
    onSave: () -> Unit,
    onCancel: () -> Unit,
    onWithdraw: () -> Unit, // 회원탈퇴는 한번 더 체크
    onLogout: suspend () -> Unit
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope() // 코루틴 스코프 생성
    var showDialog by remember { mutableStateOf(false) }

    Column {
        Text("개인정보 수정", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(16.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(Modifier.padding(16.dp)) {
                Text("회원정보 변경", style = MaterialTheme.typography.bodyLarge)
                Spacer(Modifier.height(8.dp))

                OutlinedTextField(
                    value = nickname,
                    onValueChange = onNicknameChange,
                    label = { Text("닉네임") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(Modifier.height(8.dp))

                OutlinedTextField(
                    value = email,
                    onValueChange = {}, // 수정 불가
                    enabled = false,
                    label = { Text("이메일") },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }

        Spacer(Modifier.height(16.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = {
                onSave()
                Toast.makeText(context, "변경 닉네임이 저장되었습니다.", Toast.LENGTH_SHORT).show()
            }, modifier = Modifier.weight(1f)) { Text("저장") }
            OutlinedButton(onClick = onCancel, modifier = Modifier.weight(1f)) { Text("취소") }
        }

        Spacer(Modifier.height(8.dp))

        Button(
            onClick = {
                scope.launch {
                    onLogout()
                    Toast.makeText(context, "로그아웃이 완료되었습니다.", Toast.LENGTH_SHORT).show()
                }
            },
            modifier = Modifier.fillMaxWidth() // 가로 최대
        ) {
            Text("로그아웃")
        }

        TextButton(onClick = { showDialog = true }) {
            Text("회원탈퇴", color = Color.Gray)
        }

        // 탈퇴 다이얼로그 추가
        if (showDialog) {
            androidx.compose.material3.AlertDialog(
                onDismissRequest = { showDialog = false },
                title = { Text("회원탈퇴") },
                text = { Text("정말로 회원탈퇴 하시겠습니까? 이 작업은 되돌릴 수 없습니다.") },
                confirmButton = {
                    Button(onClick = {
                        showDialog = false
                        onWithdraw()
                        Toast.makeText(context, "회원탈퇴가 완료되었습니다.", Toast.LENGTH_SHORT).show()
                    }) {
                        Text("확인")
                    }
                },
                dismissButton = {
                    OutlinedButton(onClick = { showDialog = false }) {
                        Text("취소")
                    }
                }
            )
        }
    }
}

@Composable
fun AlarmSettingScreen(
    isAlarmEnabled: Boolean,
    onAlarmToggle: (Boolean) -> Unit,
    onSave: () -> Unit,
    onCancel: () -> Unit
) {
    val context = LocalContext.current
    Column {
        Text(text = "push 알람 설정", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(16.dp))

        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("알림", style = MaterialTheme.typography.bodyLarge)
                Switch(
                    checked = isAlarmEnabled,
                    onCheckedChange = onAlarmToggle
                )
            }
        }

        Spacer(Modifier.height(16.dp))

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(
                onClick = {
                    onSave()
                    Toast.makeText(context, "알림 설정이 저장되었습니다.", Toast.LENGTH_SHORT).show()
                }, modifier = Modifier.weight(1f)
            ) { Text("저장") }
            OutlinedButton(onClick = onCancel, modifier = Modifier.weight(1f)) { Text("취소") }
        }
    }
}
