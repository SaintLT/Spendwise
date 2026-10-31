plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}
val runNo = System.getenv("GITHUB_RUN_NUMBER") ?: "1"
// The signing key is no longer stored in the repository. GitHub Actions supplies it from
// private Secrets (see .github/workflows/build.yml). Without it, for example when you open
// the project on your own computer, the app is signed with the debug key instead.
val keystorePath: String? = System.getenv("KEYSTORE_PATH")?.takeIf { it.isNotBlank() }
android {
    namespace = "com.spendwise.app"
    compileSdk = 34
    defaultConfig {
        applicationId = "com.spendwise.app"
        minSdk = 26
        targetSdk = 34
        versionCode = runNo.toInt()
        versionName = "1.0." + runNo
    }
    signingConfigs {
        if (keystorePath != null) {
            create("release") {
                storeFile = rootProject.file(keystorePath!!)
                storeType = "pkcs12"
                storePassword = System.getenv("KEYSTORE_PASSWORD")
                keyAlias = System.getenv("KEY_ALIAS")
                keyPassword = System.getenv("KEY_PASSWORD")
            }
        }
    }
    buildTypes {
        release {
            signingConfig = if (keystorePath != null) signingConfigs.getByName("release") else signingConfigs.getByName("debug")
            isMinifyEnabled = false
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions { jvmTarget = "17" }
}
