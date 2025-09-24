package com.ssafy.dgg.model.data

import kotlinx.serialization.Serializable

@Serializable
data class AlarmSettingsDTO (
    val generalEnabled: Boolean,
    val sleepEnabled: Boolean
)