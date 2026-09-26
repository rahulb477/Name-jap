plugins {
    alias(libs.plugins.android.application)
}

// The APK bundles the React production build: dist/ is produced by
// `npm ci && npm run build` and is registered below as the app's web assets.
// The WebView loads file:///android_asset/index.html — the self-contained
// single-file release build of the existing Naam Jap web application.
val webAppDir = rootProject.file("dist")

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

    // Ship the React production build (dist/) inside the APK's assets.
    sourceSets {
        named("main") {
            assets.srcDir(webAppDir)
        }
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

/**
 * Fails the Android build when the React production build is missing or
 * empty, so a hollow APK (no web application inside) can never be
 * produced. The web app is created by `npm ci && npm run build`, which the
 * CI pipeline runs before any Gradle step.
 */
val verifyWebApp by tasks.registering {
    doLast {
        val index = webAppDir.resolve("index.html")
        if (!index.isFile || index.length() == 0L) {
            throw GradleException(
                "dist/index.html is missing or empty. The Android APK bundles the " +
                    "React production build — run 'npm ci && npm run build' before " +
                    "building the APK."
            )
        }
        logger.lifecycle("Bundling React production build into APK assets: dist/ (index.html: ${index.length()} bytes)")
    }
}

tasks.named("preBuild") {
    dependsOn(verifyWebApp)
}
