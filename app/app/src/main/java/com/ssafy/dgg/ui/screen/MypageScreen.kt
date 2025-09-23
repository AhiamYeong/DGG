package com.ssafy.dgg.ui.screen

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
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun MyPageScreen(modifier: Modifier = Modifier) {
    Column (
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(32.dp)
    ) {
        ProfileEditScreen(
            nickname = "Mock",
            email = "test@example.com",
            onNicknameChange = {},
            onSave = {},
            onCancel = {},
            onWithdraw = {},
        )
        AlarmSettingScreen(
            isAlarmEnabled = true,
            onAlarmToggle = {},
            onSave = {},
            onCancel = {},
        )
    }
}

@Composable
fun ProfileEditScreen(
    nickname: String,
    email: String,
    onNicknameChange: (String) -> Unit,
    onSave: () -> Unit,
    onCancel: () -> Unit,
    onWithdraw: () -> Unit
){
    Column {
        Text("개인정보 수정", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(16.dp))

        Card (
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column (Modifier.padding(16.dp)){
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

        Row (horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = onSave, modifier = Modifier.weight(1f)) {Text("저장")}
            OutlinedButton(onClick = onCancel, modifier = Modifier.weight(1f)) { Text("취소") }
        }

        Spacer(Modifier.height(8.dp))

        Button(
            onClick = { /* TODO */ },
            modifier = Modifier.fillMaxWidth() // 가로 최대
        ) {
            Text("로그아웃")
        }

        TextButton(onClick = onWithdraw) {
            Text("회원탈퇴", color = Color.Gray)
        }
    }
}

@Composable
fun AlarmSettingScreen(
    isAlarmEnabled: Boolean,
    onAlarmToggle: (Boolean) -> Unit,
    onSave: () -> Unit,
    onCancel: () -> Unit
){
    Column {
        Text(text="push 알람 설정", style = MaterialTheme.typography.titleMedium)
        Spacer(Modifier.height(16.dp))

        Card (
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp)
        ){
            Row (
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

        Row (horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            Button(onClick = onSave, modifier = Modifier.weight(1f)) { Text("저장") }
            OutlinedButton(onClick = onCancel, modifier = Modifier.weight(1f)) { Text("취소") }
        }
    }
}