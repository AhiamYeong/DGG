package com.ssafy.dgg.util

import java.time.Duration

fun formatDuration(duration: Duration?): String {
    if (duration == null) return "0초"

    val hours = duration.toHours()
    val minutes = duration.toMinutes() % 60
    val seconds = duration.seconds % 60

    return buildString {
        if (hours > 0) append("${hours}시간 ")
        if (minutes > 0) append("${minutes}분 ")
        append("${seconds}초")
    }
}
