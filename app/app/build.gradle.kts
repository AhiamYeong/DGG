import java.util.Properties

val localProperties = Properties().apply {
    val file = rootProject.file("local.properties")
    if (file.exists()) {
        file.inputStream().use { load(it) }
    }
}

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    // add google services gradle plugin
    id("com.google.gms.google-services")
    id("kotlin-parcelize")
    alias(libs.plugins.parcelize)
    // kotlin serializable plugin
    id("org.jetbrains.kotlin.plugin.serialization") version "1.9.22" // Adjust the version to match your Kotlin version

}

android {
    namespace = "com.ssafy.dgg"
    compileSdk = 36

    defaultConfig {
        buildConfigField(
            "String",
            "GOOGLE_CLIENT_ID",
            "\"${localProperties.getProperty("WEB_CLIENT_ID")}\""        )

        applicationId = "com.ssafy.dgg"
        minSdk = 29
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {

        // 개발용 추가
        debug {
            isDebuggable = true
            // applicationIdSuffix = ".debug"
            versionNameSuffix = "-DEBUG"

            buildConfigField("String", "API_BASE_URL", "\"http://localhost:8080/api/v1/\"")
            buildConfigField("String", "WEB_URL", "\"https://j13a305.p.ssafy.io\"")

            buildConfigField("boolean", "IS_DEBUG", "true")
            resValue("string", "dgg", "DGG 개발")

        }

        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )

            // 웹뷰용 URL
            buildConfigField("String", "WEB_URL", "\"https://j13a305.p.ssafy.io/\"")
            // API 호출용 URL
            buildConfigField("String", "API_BASE_URL", "\"https://api.dgg.com\"")


            buildConfigField("boolean", "IS_DEBUG", "false")

            resValue("string", "dgg", "DGG")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.activity.compose)
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.graphics)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.compose.ui.test.junit4)
    debugImplementation(libs.androidx.compose.ui.tooling)
    debugImplementation(libs.androidx.compose.ui.test.manifest)

    // Add the platform dependency for the Firebase Bill of Materials (BoM)
    implementation(platform("com.google.firebase:firebase-bom:33.0.0"))

    // When using the BoM, don't specify versions in Firebase dependencies
    implementation("com.google.firebase:firebase-analytics")
    implementation("com.google.firebase:firebase-messaging-ktx")
    // Add the dependencies for any other desired Firebase products
    // https://firebase.google.com/docs/android/setup#available-libraries
    implementation("androidx.work:work-runtime-ktx:2.9.0")

    // samsung health SDK
    implementation(fileTree(mapOf("dir" to "libs", "include" to listOf("*.aar"))))
    implementation(libs.gson)

    // Retrofit - maven central repo에서 찾음
    implementation("com.squareup.retrofit2:retrofit:3.0.0")

    // 아래 3개는 쨈민이 추천...
    // Add Kotlinx Serialization library
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
    // Add Retrofit converter for Kotlinx Serialization
    implementation("com.jakewharton.retrofit:retrofit2-kotlinx-serialization-converter:1.0.0")
    // Recommended: Add OkHttp logging interceptor for debugging API calls
    implementation("com.squareup.okhttp3:logging-interceptor:4.12.0")

    implementation("androidx.credentials:credentials:1.3.0")
    implementation("androidx.credentials:credentials-play-services-auth:1.3.0")
    implementation("com.google.android.libraries.identity.googleid:googleid:1.1.1")
    // gemini 추천...
    implementation("com.google.android.gms:play-services-auth:21.2.0")

    // Unit Test용
    testImplementation("junit:junit:4.13.2")
    // 기본 UnitTest
    testImplementation("com.squareup.okhttp3:mockwebserver:4.12.0")
    // MockWebServer
    testImplementation("org.mockito:mockito-core:5.6.0")
    // 필요하면 Mockito
}
