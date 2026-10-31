package com.spendwise.app

import android.Manifest
import android.annotation.TargetApi
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageManager
import android.hardware.biometrics.BiometricManager
import android.hardware.biometrics.BiometricPrompt
import android.net.Uri
import android.provider.Settings
import android.os.Build
import android.os.Bundle
import android.os.CancellationSignal
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
        web = WebView(this)
        setContentView(web)
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.webChromeClient = WebChromeClient()
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

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (web.canGoBack()) web.goBack() else super.onBackPressed()
    }
}
