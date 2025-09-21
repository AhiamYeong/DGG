package com.ssafy.dgg.model.repository.api

import android.app.Activity
import com.samsung.android.sdk.health.data.HealthDataStore

/* 삼성헬스 권한 확인 & 요청 */
class HealthPermissionRepository(private val store: HealthDataStore) {

    suspend fun hasPermissions(): Boolean {
        val granted = store.getGrantedPermissions(HealthPermissions.REQUIRED)
        return granted.containsAll(HealthPermissions.REQUIRED)
    }

    suspend fun requestPermissions(activity: Activity): Boolean {
        val result = store.requestPermissions(HealthPermissions.REQUIRED, activity)
        return result.containsAll(HealthPermissions.REQUIRED)
    }
}
