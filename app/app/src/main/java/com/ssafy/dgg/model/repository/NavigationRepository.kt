package com.ssafy.dgg.model.repository

import android.location.Location
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow


class NavigationRepository {
    private val _locationFlow = MutableSharedFlow<Location>()
    val locationFlow = _locationFlow.asSharedFlow()

    suspend fun updateLocation(location: Location) {
        _locationFlow.emit(location)
    }
}
