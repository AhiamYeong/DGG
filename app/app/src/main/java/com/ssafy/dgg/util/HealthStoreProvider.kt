package com.ssafy.dgg.util

import android.content.Context
import com.samsung.android.sdk.health.data.HealthDataService
import com.samsung.android.sdk.health.data.HealthDataStore

/* 삼성헬스 데이터스토어 가져오기 */
object HealthStoreProvider {
    private var store: HealthDataStore? = null

    fun getStore(context: Context): HealthDataStore {
        if (store == null) {
            store = HealthDataService.getStore(context.applicationContext)
        }
        return store!!
    }
}
