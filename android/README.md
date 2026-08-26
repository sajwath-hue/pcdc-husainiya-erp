# Husainiya PCDC ERP — Android app

A thin WebView wrapper around the deployed web app (see `../DEPLOY.md` for
getting a live URL first — this app is useless without one, since all
the actual logic/data lives on the server).

## Build via GitHub Actions (no local Android setup needed)

1. On GitHub, open this repo → **Actions** tab → **Build Android APK** →
   **Run workflow**.
2. Enter your deployed URL (e.g. `https://pcdc-husainiya-erp.onrender.com/login`)
   in the `base_url` field, then run it.
3. When the run finishes, open it and download the `pcdc-husainiya-erp-debug-apk`
   artifact — that zip contains `app-debug.apk`.
4. Copy the APK to an Android phone and install it (you'll need to allow
   "install from unknown sources" for a debug build not from the Play Store).

## Build locally with Android Studio

1. Open the `android/` folder as a project in Android Studio (it will
   download the SDK/AGP itself if needed).
2. Edit `gradle.properties` → set `appBaseUrl` to your deployed URL.
3. Build → Build Bundle(s) / APK(s) → Build APK(s).

## What it does (and doesn't) do

- Loads `BuildConfig.BASE_URL` in a WebView with cookies/JS/local storage
  enabled (needed for the session-cookie login).
- Supports the "Upload Signed Agreement" file picker and "Download PDF"
  links (routed through Android's DownloadManager).
- Back button navigates the WebView history before exiting the app.
- It does **not** work offline — there's no local database or asset
  bundling; every screen is fetched live from the deployed server, same
  as opening it in a mobile browser.
