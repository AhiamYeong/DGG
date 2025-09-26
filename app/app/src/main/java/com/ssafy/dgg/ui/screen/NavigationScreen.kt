package com.ssafy.dgg.ui.screen

import androidx.compose.foundation.layout.Column
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import androidx.lifecycle.viewmodel.compose.viewModel
import com.ssafy.dgg.model.repository.NavigationRepository
import com.ssafy.dgg.viewModel.NavigationViewModel
import com.ssafy.dgg.viewModel.NavigationViewModelFactory

@Composable
fun NavigationScreen() {
    val context = LocalContext.current.applicationContext
    val repo = remember { NavigationRepository() }
    val factory = remember { NavigationViewModelFactory(repo, context) }

    val viewModel: NavigationViewModel = viewModel(factory = factory)

    Column {
        Button(onClick = { viewModel.startService() }) {
            Text("네비게이션 시작")
        }
        Button(onClick = { viewModel.stopService() }) {
            Text("네비게이션 종료")
        }
    }
}
