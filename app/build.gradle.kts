plugins {
    alias(libs.plugins.android.application)
}

android {
    namespace = "app.naamjap.counter"
    compileSdk = 36

    defaultConfig {
        applicationId = "app.naamjap.counter"
        minSdk = 24
        targetSdk = 36
        versionCode = 1
        versionName = "1.3.0"
    }

    // Use the temporary CI debug keystore (created by the GitHub Actions
    // workflow before the build) when it exists at the repository root.
    // Local builds without ./debug.keystore keep the default AGP debug
    // keystore. No production signing credentials are introduced.
    val temporaryDebugKeystore = rootProject.file("debug.keystore")
    if (temporaryDebugKeystore.exists()) {
        signingConfigs.getByName("debug").apply {
            storeFile = temporaryDebugKeystore
            storePassword = "android"
            keyAlias = "androiddebugkey"
            keyPassword = "android"
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}
