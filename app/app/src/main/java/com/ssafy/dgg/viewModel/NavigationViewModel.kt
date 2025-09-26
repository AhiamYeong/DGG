package com.ssafy.dgg.viewModel

import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import com.ssafy.dgg.model.repository.NavigationRepository
import com.ssafy.dgg.service.MyNavigationService

class NavigationViewModel(
    private val repo: NavigationRepository,
    private val appContext: Context
) : ViewModel() {

    fun startService() {
        val intent = Intent(appContext, MyNavigationService::class.java)
        ContextCompat.startForegroundService(appContext, intent)
    }

    fun stopService() {
        val intent = Intent(appContext, MyNavigationService::class.java)
        appContext.stopService(intent)
    }
}

class NavigationViewModelFactory(
    private val repo: NavigationRepository,
    private val context: Context
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(NavigationViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return NavigationViewModel(repo, context) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
