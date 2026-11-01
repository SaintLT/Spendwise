# Spendwise

An Android app that reads your M-Pesa messages, tracks every transaction and warns you when you go over your daily, weekly or monthly spending limit. All data stays on your phone.

## Features

- **Welcome and profile:** add your name, an optional email and a colour theme on first launch. Home greets you by time of day.
- **Home:** a Mon to Sun week strip, and Today / This week / This month boxes. Tap a box and the whole screen switches to that view.
- **Spending limits:** a separate daily, weekly and monthly limit. The limit card follows the view you pick, with On track, Slow down and Over limit states.
- **Insights:** who received the most money, how this day, week or month compares with the one before, top category, biggest expense and top recipients.
- **Transactions:** search by note, category, amount or date across all months. Optional category budgets.
- **Themes:** five colour themes (Ocean, Emerald, Royal, Sunset, Rose) in light, dark or pure black.
- **Security:** PIN lock with optional fingerprint unlock.
- **Your data:** CSV export and copy and paste backup and restore.
- **Private:** the app has no internet permission. Nothing leaves your phone.

## Install

Open the latest release on your phone and download `Spendwise.apk`.
To get updates automatically, add this repo to the Obtainium app.

## Project structure

```
app/src/main/
  AndroidManifest.xml                      permissions (read SMS, fingerprint)
  java/com/spendwise/app/MainActivity.kt   WebView shell: reads SMS, fingerprint prompt, opens links
  assets/
    spendwise.html                         page layout
    spendwise.css                          styles and theme variables
    spendwise.js                           all app logic, in labelled sections
  res/                                     launcher icon
.github/workflows/build.yml                builds and publishes the APK
```

## Building and signing

Every push to `main` builds a signed APK and publishes it under **Releases**.

The signing key is **not** stored in this repo. Add these four secrets under
**Settings > Secrets and variables > Actions**:

| Secret | What it is |
|---|---|
| `KEYSTORE_BASE64` | your `.jks` keystore file, converted to base64 text |
| `KEYSTORE_PASSWORD` | the keystore password |
| `KEY_ALIAS` | the key alias (`spendwise`) |
| `KEY_PASSWORD` | the key password |

Keep the keystore file and its password somewhere safe and private. If you lose them, the app can no longer be updated in place. Never commit a keystore to the repo.

Building on your own computer works without the secrets. The app is then signed with the debug key.
