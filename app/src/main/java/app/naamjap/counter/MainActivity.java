package app.naamjap.counter;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * Thin WebView shell around the existing React/Vite "Naam Jap" application.
 *
 * The complete production web build (dist/, produced by `npm ci && npm run
 * build`) is packaged into this APK's assets by the Gradle build, and the
 * WebView loads {@code file:///android_asset/index.html} — the single
 * self-contained HTML file of the app (all JS/CSS/images inlined by
 * vite-plugin-singlefile). Nothing of the UI is recreated natively; the
 * React application remains the UI, fully offline-capable.
 */
public class MainActivity extends Activity {

    private static final String TAG = "NaamJap";

    /** Entry point of the bundled React production build. */
    private static final String WEB_ENTRY = "file:///android_asset/index.html";

    /** Runtime permission request code for the web app's microphone flow. */
    private static final int REQUEST_CODE_MICROPHONE = 1001;

    /**
     * Background of the React app's splash screen (#F3EDE3). Used as the
     * WebView + window background so the native launch blends straight into
     * the in-app splash (no second, separate splash screen).
     */
    private static final int SPLASH_BACKGROUND = 0xFFF3EDE3;

    private WebView webView;
    private PermissionRequest pendingAudioRequest;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);

        // Only the settings the existing web application needs:
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);    // localStorage: counts, settings, language
        settings.setAllowFileAccess(true);      // load the bundled app from file:///android_asset
        // Keep the secure defaults: the page may NOT read other local files
        // via file:// URLs.
        settings.setAllowFileAccessFromFileURLs(false);
        settings.setAllowUniversalAccessFromFileURLs(false);
        // Mantra TTS may start without an immediate user gesture.
        settings.setMediaPlaybackRequiresUserGesture(false);

        webView.setBackgroundColor(SPLASH_BACKGROUND);
        webView.setWebViewClient(new AppWebViewClient());
        webView.setWebChromeClient(new AppWebChromeClient());

        setContentView(webView);

        if (savedInstanceState != null) {
            webView.restoreState(savedInstanceState);
        } else {
            webView.loadUrl(WEB_ENTRY);
        }
    }

    /* ---------------- web navigation ---------------- */

    /**
     * The bundled app (file://) stays inside the WebView. Links out of it
     * (mailto:, tel:, http/https) are handed to the appropriate Android app
     * instead of being forced into the WebView.
     */
    private class AppWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            String scheme = uri.getScheme();
            if ("file".equals(scheme)) {
                return false; // stay inside the bundled app
            }
            openExternally(uri);
            return true;
        }

        private void openExternally(Uri uri) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
            } catch (Exception e) {
                Log.w(TAG, "No app can handle " + uri.getScheme() + " link", e);
            }
        }
    }

    /* ---------------- microphone (web voice feature) ---------------- */

    /**
     * The web app's Voice tab calls getUserMedia({audio:true}). Grant the
     * audio resource when the Android runtime permission is held; otherwise
     * trigger the system permission dialog and settle the web request from
     * onRequestPermissionsResult().
     *
     * Note: Android WebView does not implement the Web Speech *recognition*
     * API (webkitSpeechRecognition). The web app detects that and falls back
     * to its built-in demo mode — this is a platform limitation of Android
     * WebView, documented rather than worked around.
     */
    private class AppWebChromeClient extends WebChromeClient {
        @Override
        public void onPermissionRequest(PermissionRequest request) {
            int count = request.getResources().size();
            String[] granted = new String[count];
            boolean audioOnly = count > 0;
            for (int i = 0; i < count; i++) {
                if (request.getResources().valueAt(i) == PermissionRequest.Resource.AUDIO_CAPTURE) {
                    granted[i] = PermissionRequest.RESOURCE_AUDIO_CAPTURE;
                } else {
                    audioOnly = false;
                    break;
                }
            }
            if (!audioOnly) {
                request.deny();
                return;
            }
            if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                request.grant(granted);
            } else {
                pendingAudioRequest = request;
                requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQUEST_CODE_MICROPHONE);
            }
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode != REQUEST_CODE_MICROPHONE || pendingAudioRequest == null) {
            return;
        }
        PermissionRequest request = pendingAudioRequest;
        pendingAudioRequest = null;
        boolean granted = grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED;
        if (granted) {
            request.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
        } else {
            request.deny();
        }
    }

    /* ---------------- back button ---------------- */

    /**
     * Android back first walks the WebView history (the app is hash-routed,
     * so in-app navigation is handled by the web app); it only exits the app
     * when there is no navigation history to go back into.
     */
    @SuppressWarnings("deprecation")
    @Override
    public void onBackPressed() {
        if (webView != null && webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    /* ---------------- lifecycle ---------------- */

    @Override
    protected void onSaveInstanceState(Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) {
            webView.saveState(outState);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) {
            webView.onResume();
        }
    }

    @Override
    protected void onPause() {
        if (webView != null) {
            webView.onPause();
        }
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
