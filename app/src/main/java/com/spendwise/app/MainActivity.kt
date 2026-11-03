package com.spendwise.app

import android.Manifest
import android.annotation.TargetApi
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.hardware.biometrics.BiometricManager
import android.hardware.biometrics.BiometricPrompt
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.CancellationSignal
import android.os.SystemClock
import android.graphics.Color
import android.view.View
import android.widget.Toast
import android.webkit.RenderProcessGoneDetail
import android.webkit.WebResourceRequest
import android.webkit.WebViewClient
import android.provider.Settings
import android.provider.Telephony
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import org.json.JSONArray
import org.json.JSONObject

class MainActivity : Activity() {
    private lateinit var web: WebView

    // Exposed to the page as `Android`. Only local app assets are ever loaded (no internet permission).
    inner class Bridge {
        @JavascriptInterface
        fun hasPermission() =
            checkSelfPermission(Manifest.permission.READ_SMS) == PackageManager.PERMISSION_GRANTED

        @JavascriptInterface
        fun requestPermission() = runOnUiThread {
            requestPermissions(arrayOf(Manifest.permission.READ_SMS), 1)
        }

        // True only when this phone has a fingerprint (or face) enrolled and Android 10 or newer.
        @TargetApi(29)
        @Suppress("DEPRECATION")
        @JavascriptInterface
        fun canBiometric(): Boolean {
            if (Build.VERSION.SDK_INT < 29) return false
            val bm = getSystemService(BiometricManager::class.java) ?: return false
            return if (Build.VERSION.SDK_INT >= 30)
                bm.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_WEAK) == BiometricManager.BIOMETRIC_SUCCESS
            else
                bm.canAuthenticate() == BiometricManager.BIOMETRIC_SUCCESS
        }

        // Shows Android's own fingerprint prompt. The page is told the result through onBioResult(true/false).
        @TargetApi(29)
        @JavascriptInterface
        fun authenticate() = runOnUiThread {
            if (Build.VERSION.SDK_INT < 29 || !canBiometric()) { bioResult(false); return@runOnUiThread }
            try {
                val builder = BiometricPrompt.Builder(this@MainActivity)
                    .setTitle("Unlock Spendwise")
                    .setNegativeButton("Use PIN", mainExecutor) { _, _ -> bioResult(false) }
                if (Build.VERSION.SDK_INT >= 30)
                    builder.setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_WEAK)
                builder.build().authenticate(CancellationSignal(), mainExecutor,
                    object : BiometricPrompt.AuthenticationCallback() {
                        override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult?) { bioResult(true) }
                        override fun onAuthenticationError(errorCode: Int, errString: CharSequence?) { bioResult(false) }
                    })
            } catch (e: Exception) {
                bioResult(false)
            }
        }

        @JavascriptInterface
        fun appVersion(): String = try { packageManager.getPackageInfo(packageName, 0).versionName ?: "" } catch (e: Exception) { "" }

        // Matches the status and navigation bars to the page theme (the page calls this on every render).
        @Suppress("DEPRECATION")
        @JavascriptInterface
        fun setBars(color: String, dark: Boolean) = runOnUiThread {
            try {
                val c = Color.parseColor(color)
                window.statusBarColor = c
                window.navigationBarColor = c
                val light = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR or View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
                val f = window.decorView.systemUiVisibility
                window.decorView.systemUiVisibility = if (dark) f and light.inv() else f or light
            } catch (e: Exception) { }
        }

        @JavascriptInterface
        fun openSettings() = runOnUiThread {
            startActivity(Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:" + packageName)))
        }

        @JavascriptInterface
        fun openUrl(url: String) {
            if (url.startsWith("https://github.com/SaintLT/Spendwise")) runOnUiThread { startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url))) }
        }

        @JavascriptInterface
        fun readSms(days: Int, senders: String): String {
            val out = JSONArray()
            if (!hasPermission()) return out.toString()
            val since = System.currentTimeMillis() - days * 86_400_000L
            // Only read messages from the allowed senders (default: MPESA), never personal chats.
            val list = senders.split(",").map { it.trim() }.filter { it.isNotEmpty() }.ifEmpty { listOf("MPESA") }
            contentResolver.query(
                Telephony.Sms.Inbox.CONTENT_URI,
                arrayOf(Telephony.Sms.ADDRESS, Telephony.Sms.BODY, Telephony.Sms.DATE),
                "${Telephony.Sms.DATE} > ? AND (" + list.joinToString(" OR ") { "UPPER(${Telephony.Sms.ADDRESS}) LIKE ?" } + ")",
                arrayOf(since.toString()) + list.map { "%" + it.uppercase() + "%" },
                "${Telephony.Sms.DATE} DESC"
            )?.use { c ->
                while (c.moveToNext()) {
                    out.put(JSONObject()
                        .put("from", c.getString(0) ?: "")
                        .put("body", c.getString(1) ?: "")
                        .put("ts", c.getLong(2)))
                }
            }
            return out.toString()
        }
    }

    private fun bioResult(ok: Boolean) {
        if (::web.isInitialized) web.evaluateJavascript("window.onBioResult&&onBioResult($ok)", null)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        window.statusBarColor = Color.BLACK
        window.navigationBarColor = Color.BLACK
        web = WebView(this)
        web.setBackgroundColor(Color.BLACK)
        setContentView(web)
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        // Only the bundled page is ever shown. Asset loading is unaffected by these switches and
        // localStorage (your saved data) keeps the same file:// origin, so nothing is lost.
        web.settings.allowFileAccess = false
        web.settings.allowContentAccess = false
        web.webChromeClient = WebChromeClient()
        web.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean = true
            override fun onRenderProcessGone(view: WebView?, detail: RenderProcessGoneDetail?): Boolean { recreate(); return true }
        }
        web.addJavascriptInterface(Bridge(), "Android")
        web.loadUrl("file:///android_asset/spendwise.html")
    }

    override fun onPause() {
        super.onPause()
        if (::web.isInitialized) web.evaluateJavascript("window.onAppPause&&onAppPause()", null)
    }

    override fun onResume() {
        super.onResume()
        if (::web.isInitialized) web.evaluateJavascript("window.onAppResume&&onAppResume()", null)
    }

    override fun onRequestPermissionsResult(code: Int, perms: Array<out String>, res: IntArray) {
        web.evaluateJavascript("window.onSmsPermission&&onSmsPermission()", null)
    }

    private var lastBack = 0L

    // The page owns the navigation history (screens, sheets, dialogs), so ask it first. Only when it
    // reports it is already at the start (Home) do we treat the press as an exit request, and that
    // needs a second press within two seconds, so Spendwise never closes by accident.
    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        web.evaluateJavascript("(function(){try{return window.swBack?swBack():'root'}catch(e){return 'root'}})()") { r ->
            if (r == null || !r.contains("consumed")) {
                val now = SystemClock.elapsedRealtime()
                if (now - lastBack < 2000) {
                    finish()
                } else {
                    lastBack = now
                    Toast.makeText(this, "Press back again to exit Spendwise", Toast.LENGTH_SHORT).show()
                }
            }
        }
    }
}
