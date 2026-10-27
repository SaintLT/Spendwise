package com.spendwise.app

import android.Manifest
import android.app.Activity
import android.content.pm.PackageManager
import android.os.Bundle
import android.provider.Telephony
import android.webkit.JavascriptInterface
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

        @JavascriptInterface
        fun readSms(days: Int): String {
            val out = JSONArray()
            if (!hasPermission()) return out.toString()
            val since = System.currentTimeMillis() - days * 86_400_000L
            contentResolver.query(
                Telephony.Sms.Inbox.CONTENT_URI,
                arrayOf(Telephony.Sms.ADDRESS, Telephony.Sms.BODY, Telephony.Sms.DATE),
                "${Telephony.Sms.DATE} > ?", arrayOf(since.toString()),
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

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        web = WebView(this)
        setContentView(web)
        web.settings.javaScriptEnabled = true
        web.settings.domStorageEnabled = true
        web.addJavascriptInterface(Bridge(), "Android")
        web.loadUrl("file:///android_asset/spendwise.html")
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
