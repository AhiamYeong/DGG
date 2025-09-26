package com.ssafy.dgg.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.ssafy.dgg.R

class MyNavigationService : Service() {

    companion object {
        const val CHANNEL_ID = "navigation_channel"
        const val NOTIFICATION_ID = 1
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification: Notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("네비게이션 실행 중")
            .setContentText("위치를 추적하고 있습니다.")
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .build()

        // 👇 foreground 로 반드시 전환해야 함
        startForeground(NOTIFICATION_ID, notification)

        // TODO: 위치 추적 시작 로직 넣기

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "Navigation Service Channel",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(serviceChannel)
        }
    }
}
