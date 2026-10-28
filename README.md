<h1 align="center">Spendwise</h1>

<p align="center">
  Track every M-Pesa transaction automatically and get warned when you pass your spending limit.
</p>

<p align="center">
  <a href="https://github.com/SaintLT/Spendwise/releases/latest"><img src="https://img.shields.io/github/v/release/SaintLT/Spendwise" alt="Latest release"></a>
  <a href="https://github.com/SaintLT/Spendwise/actions"><img src="https://github.com/SaintLT/Spendwise/actions/workflows/build.yml/badge.svg" alt="Build status"></a>
  <img src="https://img.shields.io/badge/Android-8.0%2B-3DDC84" alt="Android 8.0 and newer">
</p>

---

## What it does

Spendwise is an Android app that reads your M-Pesa confirmation messages, records each payment, and compares your spending with a weekly or monthly limit you choose. You don't type expenses in by hand.

- **Automatic tracking.** Reads messages from `MPESA` and records the amount, date, recipient and transaction fee.
- **Spending limit.** Set a weekly or monthly limit (for example KSh 7,000). The home card turns amber near the limit and red when you pass it.
- **No double counting.** Each message's transaction code is remembered, so a message is never recorded twice.
- **Money out only.** Messages about money you received are ignored.
- **Insights.** See your biggest expense, the weekday you spend most on, and the people and shops you pay most (top recipients).
- **Optional categories.** Spendwise guesses categories from merchant names such as Naivas or KPLC. Correct one once and it remembers.
- **Privacy tools.** PIN lock, light and dark mode, and a copy-and-paste backup you can restore later.
- **Paste option.** If you prefer, copy messages from your Messages app and paste them in.

## Install

1. Open the [latest release](https://github.com/SaintLT/Spendwise/releases/latest) on your phone and download `Spendwise.apk`.
2. Open the file and allow installing from your browser when Android asks. If Play Protect warns you, choose **Install anyway**.
3. Open Spendwise and allow SMS access.

**Android 13 and newer.** Android may block SMS access for apps installed from a file. If the option is greyed out, install through [Obtainium](https://github.com/ImranR98/Obtainium) instead (see below). Or go to **Settings → Apps → Spendwise**, tap **⋮** and choose **Allow restricted settings**, then allow SMS again.

## Get updates

Add `https://github.com/SaintLT/Spendwise` to [Obtainium](https://github.com/ImranR98/Obtainium). It checks this repository for new releases and updates the app for you. You can also tap **Check for updates** in Spendwise under **Budgets → Settings**.

Updates keep your data, because every release is signed with the same key.

## Privacy

- Spendwise reads only messages whose sender matches `MPESA` by default. You can change the sender names in **Budgets → Settings**.
- The app has **no internet permission**. Your messages and spending data stay on your phone.
- Nothing is sent to any server. Use **Copy backup** if you want a copy of your data.
- The PIN lock keeps other people out of the app. It does not encrypt your data.

Spendwise is an independent project. It is not made by, or affiliated with, Safaricom or M-PESA.

## How it works

| Layer | Technology | Job |
|---|---|---|
| Screens and logic | HTML, CSS, JavaScript | Totals, limits, charts, PIN lock, backup |
| Message reader | JavaScript | Finds the amount, date, recipient, fee and transaction code in each message |
| Android shell | Kotlin, WebView | Shows the screens and reads SMS from the allowed senders |
| Build and release | GitHub Actions | Builds and signs the APK and publishes it under Releases |

Every push to `main` builds a new release. The version number comes from the build number.

## Build it yourself

You don't need Android Studio. Fork this repository and push a change. GitHub Actions builds the APK and attaches it to a new release.

To build locally you need JDK 17 and Gradle 8.7, then run `gradle assembleRelease`.

`release.jks` is a signing key committed for personal use. If you fork this project to share it with other people, generate your own key and keep it private.

## Project layout

```
app/src/main/assets/spendwise.html        the app screens and message reader
app/src/main/java/com/spendwise/app/      Android shell (Kotlin)
app/src/main/res/                         app icon
.github/workflows/build.yml               cloud build and release
```

## Limitations

- It only understands the M-Pesa message wordings it was written for. Messages in other formats are skipped.
- It records only messages still in your phone's inbox.
- The limit warning shows when you open the app. It does not yet send a notification in the background.
- Android only. iPhones don't allow apps to read SMS.

## Roadmap

- Fingerprint unlock
- Background alert when you pass your limit
- Monthly reports
- Recurring bills
