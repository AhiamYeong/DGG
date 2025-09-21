// Top-level build file where you can add configuration options common to all sub-projects/modules.
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false

    // firebase add dependency for google services gradle plugin
    id("com.google.gms.google-services") version "4.4.3" apply false
}