# Spendwise

Track your M-Pesa spending and see how it compares with a daily, weekly or monthly limit.

![Latest release](https://img.shields.io/github/v/release/SaintLT/Spendwise) ![Build status](https://img.shields.io/github/actions/workflow/status/SaintLT/Spendwise/build.yml) ![Android 8.0 and newer](https://img.shields.io/badge/Android-8.0%2B-3ddc84)

## What it does

Spendwise is an Android app that reads M-Pesa confirmation messages, records every transaction and warns you when you go over your spending limit. You don't have to enter each expense manually, and all your data stays on your phone.

- **Automatic tracking:** reads messages from MPESA and records the amount, date and recipient. Sent money, till and paybill payments, received money, airtime, withdrawals, Fuliza and M-Shwari are all recognised.
- **No double counting:** remembers each transaction code so a message is never recorded twice.
- **Money in and money out:** see what came in, what went out and the net, for any day, week or month.
- **Spending limits:** a separate daily, weekly and monthly limit. The limit card turns amber as you approach it and red when you pass it.
- **Smart categories:** categories are suggested from merchant names. Correct one once and Spendwise remembers your choice.
- **Private:** the app has no internet permission. Nothing leaves your phone.

## Features

- **Welcome and profile:** add your name, an optional email and a colour theme on first launch. Home greets you by time of day.
- **Home:** a Mon to Sun week strip, month chips for quick switching, and Today / This week / This month boxes. Tap a box and the whole screen switches to that view. The view stays selected as you move to earlier days, weeks or months.
- **Insights:** who received the most money, and how this day, week or month compares with the one before.
- **Transactions:** search by name, category, amount or date, filter by Spent, Received or Not counted, edit any transaction and add expenses by hand. Money in shows a plus and money out shows a minus.
- **Spend types:** mark a transaction as spending, income, an own transfer or a loan. Own transfers and loans are not counted as spending.
- **Stats:** 7 day, 1 month, 3 month, 6 month, all time and custom ranges, with money in and out, spending by category, top people and top tills.
- **Messages:** choose which senders are read (M-Pesa, Airtel Money, Equity Bank, KCB, Co-op Bank or your own).
- **Settings:** change your name and email, the colour theme (Ocean, Emerald, Royal, Sunset, Rose), light or pure black dark mode, and your PIN. Open it from the icon on Home or the Settings tab.
- **Security:** PIN lock with optional fingerprint unlock (Android 10 and newer). The app locks again when you leave it.

## Install

The recommended way to install and keep Spendwise updated is Obtainium.

### 1. Install Obtainium

Download Obtainium for Android. On the releases page, download the APK that matches your phone. For most modern Android phones, choose the file with `arm64-v8a` in its name. Open the downloaded APK and follow Android's installation prompts.

### 2. Add Spendwise in Obtainium

1. Open Obtainium and tap **Add App**.
2. Paste this repository address: `https://github.com/SaintLT/Spendwise`
3. Tap **Add**, then tap **Install**.
4. Allow Obtainium to install apps if Android asks.
5. Open Spendwise and grant SMS permission if you want it to read M-Pesa messages.

### Install Spendwise without Obtainium

Download `Spendwise.apk` from the latest Spendwise release, open it, and follow Android's installation prompts.

If Android blocks SMS access for an app installed this way, check **Settings → Apps → Spendwise** for the restricted-settings option, then allow SMS access if available.

Android may show security warnings for apps installed outside Google Play, especially apps that request SMS access. Only install the app if you trust its source and understand the permissions it requests.

## Updates

Obtainium can check this repository for new releases and offer updates.

An update can be installed over an existing copy only when it is signed with a compatible signing identity. If the signing key changes, an Android signing-key rotation or another migration plan may be required.

## Privacy

- By default, Spendwise reads messages whose sender matches MPESA. You can change the senders in **Settings → Messages and categories**.
- The app does not request internet permission. Your messages and spending data stay on your phone.
- Spendwise does not send your messages or spending data to a server.
- The PIN lock helps keep other people out of the app, but it does not encrypt your data.

Spendwise is an independent project. It is not made by, or affiliated with, Safaricom or M-PESA.

## How it works

| Layer | Technology | Job |
|---|---|---|
| Screens and logic | HTML, CSS, JavaScript | Totals, limits, charts, categories, PIN lock |
| Message reader | JavaScript | Finds the amount, date, recipient and transaction code in each message |
| Android shell | Kotlin, WebView | Displays the screens, reads SMS from permitted senders, shows the fingerprint prompt |
| Build and release | GitHub Actions | Builds the APK and publishes releases |

The version number is based on the build number used by the workflow.

## Build it yourself

You can build the app locally with JDK 17 and Gradle 8.7. From the project folder, run:

```
gradle assembleRelease
```

Building on your own computer works without the signing secrets. The app is then signed with the debug key.

## Signing keys

Every push to `main` builds a signed APK and publishes it under **Releases**.

The signing key is **not** stored in this repo. Add these four secrets under **Settings > Secrets and variables > Actions**:

| Secret | What it is |
|---|---|
| `KEYSTORE_BASE64` | your `.jks` keystore file, converted to base64 text |
| `KEYSTORE_PASSWORD` | the keystore password |
| `KEY_ALIAS` | the key alias (`spendwise`) |
| `KEY_PASSWORD` | the key password |

Never commit a signing keystore or its passwords to a repository. Keep the keystore file and its password somewhere safe and private. If you lose them, the app can no longer be updated in place.

The repository's previous signing key was exposed. Removing it from the current files does not remove copies from Git history or undo that exposure. Complete and test the signing-key migration before publishing a release intended to update existing installations.

If you fork this project, create your own signing key, keep it private, and configure your own release workflow.

## Project layout

```
app/src/main/
  AndroidManifest.xml                      permissions (read SMS, fingerprint)
  java/com/spendwise/app/MainActivity.kt   WebView shell: reads SMS, fingerprint prompt, opens links
  assets/
    index.html                             the whole app: layout, styles and logic in one file
  res/                                     launcher icon
.github/workflows/build.yml                builds and publishes the APK
```

## Limitations

- Spendwise understands the M-Pesa message formats it was written for. Messages from other senders are read on a best-effort basis, and other formats may be skipped.
- It records only messages that are still in your phone's inbox.
- The spending-limit warning appears when you open the app. It does not yet send background notifications.
- Spendwise is for Android. iPhones do not allow apps to read SMS in the same way.

## Roadmap

- Background alerts when you pass your limit
- Monthly reports
- Recurring bills
- Online accounts with email sign-in
