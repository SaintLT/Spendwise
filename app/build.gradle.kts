plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}
val runNo = System.getenv("GITHUB_RUN_NUMBER") ?: "1"
android {
    namespace = "com.spendwise.app"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.spendwise.app"
        minSdk = 24
        targetSdk = 34
        versionCode = runNo.toInt()
        versionName = "1.0." + runNo
    }
    signingConfigs {
        create("release") {
            storeFile = rootProject.file("release.jks")
            storeType = "pkcs12"
            storePassword = "oRerPVc6THsysCdu"
            keyAlias = "spendwise"
            keyPassword = "oRerPVc6THsysCdu"
        }
    }
    buildTypes {
        release {
            signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}
