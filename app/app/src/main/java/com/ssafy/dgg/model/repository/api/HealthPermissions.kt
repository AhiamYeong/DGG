package com.ssafy.dgg.model.repository.api

import com.samsung.android.sdk.health.data.permission.AccessType
import com.samsung.android.sdk.health.data.permission.Permission
import com.samsung.android.sdk.health.data.request.DataTypes

/* 삼성헬스 권한 목록 나열 */
object HealthPermissions {
    val REQUIRED = setOf(
        Permission.of(DataTypes.STEPS, AccessType.READ)
    )
}