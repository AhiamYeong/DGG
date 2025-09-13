plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    // add google services gradle plugin
    id("com.google.gms.google-services")
    id("kotlin-parcelize")
    alias(libs.plugins.parcelize)
}

android {
    namespace = "com.ssafy.dgg"
    compileSdk = 36

    defaultConfig {
        applicationId = "com.ssafy.dgg"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {

        // 개발용 추가
        debug {
            isDebuggable = true
            applicationIdSuffix = ".debug"
            versionNameSuffix = "-DEBUG"

            // React 웹뷰용 URL
            buildConfigField("String", "WEB_URL", "\"http://localhost:3000\"")

            // native의 직접 API 호출용 URL
            buildConfigField("String", "WEB_URL", "\"http://localhost:8080\"")

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
            buildConfigField("String", "WEB_URL", "\"https://dgg-frontend.netlify.app\"")
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
}
