# Spendwise

<p align="center">
  Track your M-Pesa spending and see how it compares with a weekly or monthly limit.
</p>

<p align="center">
  <a href="https://github.com/SaintLT/Spendwise/releases/latest"><img src="https://img.shields.io/github/v/release/SaintLT/Spendwise" alt="Latest release"></a>
  <a href="https://github.com/SaintLT/Spendwise/actions"><img src="https://github.com/SaintLT/Spendwise/actions/workflows/build.yml/badge.svg" alt="Build status"></a>
  <img src="https://img.shields.io/badge/Android-8.0%2B-3DDC84" alt="Android 8.0 and newer">
</p>

---

## What it does

Spendwise is an Android app that reads M-Pesa confirmation messages, records payments, and compares spending with a weekly or monthly limit. You don't have to enter each expense manually.

- **Automatic tracking:** Reads messages from `MPESA` and records the amount, date, recipient, and transaction fee.
- **Spending limits:** Set a weekly or monthly limit. The home card turns amber as you approach it and red when you pass it.
- **No double counting:** Remembers each transaction code so a message isn't recorded twice.
- **Money out only:** Ignores messages about money you received.
- **Insights:** Shows your biggest expense, the weekday you spend most, and your top recipients.
- **Optional categories:** Suggests categories based on merchant names. Correct a category once and it remembers your choice.
- **Privacy tools:** PIN lock, light and dark mode, and a copy-and-paste backup you can restore later.
- **Paste option:** Copy messages from your Messages app and paste them into Spendwise.

## Install

The recommended way to install and keep Spendwise updated is [Obtainium](https://github.com/ImranR98/Obtainium).

### 1. Install Obtainium

**[Download Obtainium for Android](https://github.com/ImranR98/Obtainium/releases/latest)**

On the releases page, download the APK that matches your phone. For most modern Android phones, choose the file with `arm64-v8a` in its name. Open the downloaded APK and follow Android's installation prompts.

### 2. Add Spendwise in Obtainium

1. Open Obtainium and tap **Add App**.
2. Paste this repository address: `https://github.com/SaintLT/Spendwise`
3. Tap **Add**, then tap **Install**.
4. Allow Obtainium to install apps if Android asks.
5. Open Spendwise and grant SMS permission if you want it to read M-Pesa messages.

### Install Spendwise without Obtainium

Download `Spendwise.apk` from the [latest Spendwise release](https://github.com/SaintLT/Spendwise/releases/latest), open it, and follow Android's installation prompts.

If Android blocks SMS access for an app installed this way, check **Settings → Apps → Spendwise** for the restricted-settings option, then allow SMS access if available.

Android may show security warnings for apps installed outside Google Play, especially apps that request SMS access. Only install the app if you trust its source and understand the permissions it requests.

## Updates

Obtainium can check this repository for new releases and offer updates. You can also check for updates in Spendwise under **Budgets → Settings**.

An update can be installed over an existing copy only when it is signed with a compatible signing identity. If the signing key changes, an Android signing-key rotation or another migration plan may be required.

## Privacy

- By default, Spendwise reads messages whose sender matches `MPESA`. You can change the sender names in **Budgets → Settings**.
- The app does not request internet permission. Your messages and spending data stay on your phone.
- Spendwise does not send your messages or spending data to a server.
- Use **Copy backup** if you want to keep a separate copy of your data.
- The PIN lock helps keep other people out of the app, but it does not encrypt your data.

Spendwise is an independent project. It is not made by, or affiliated with, Safaricom or M-PESA.

## How it works

| Layer | Technology | Job |
|---|---|---|
| Screens and logic | HTML, CSS, JavaScript | Totals, limits, charts, PIN lock, and backup |
| Message reader | JavaScript | Finds the amount, date, recipient, fee, and transaction code in each message |
| Android shell | Kotlin, WebView | Displays the screens and reads SMS from permitted senders |
| Build and release | GitHub Actions | Builds the APK and publishes releases |

The version number is based on the build number used by the workflow.

## Build it yourself

You can build the app locally with JDK 17 and Gradle 8.7. From the project folder, run:

```bash
gradle assembleRelease
```

### Signing keys

Never commit a signing keystore or its passwords to a repository. Keep signing credentials out of source control and use protected GitHub Actions secrets for automated release builds.

The repository's previous signing key was exposed. Removing it from the current files does not remove copies from Git history or undo that exposure. Complete and test the signing-key migration before publishing a release intended to update existing installations.

If you fork this project, create your own signing key, keep it private, and configure your own release workflow.

## Project layout

```text
app
