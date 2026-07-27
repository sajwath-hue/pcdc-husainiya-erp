# Al Husainiya ERP

A React Native app built with Expo SDK 57, Expo Router, TypeScript, and Firebase
(Authentication + Firestore) for managing Members, Donations, and Events.

## Stack

- Expo SDK 57 / React Native 0.86 / React 19.2
- Expo Router 57 (file-based navigation, `Stack.Protected` auth guards)
- TypeScript (strict mode)
- Firebase JS SDK v12 (Auth with AsyncStorage persistence, Firestore)
- New Architecture enabled

## Project structure

```
app/
  _layout.tsx          Root layout: AuthProvider, splash-screen control, auth-guarded Stack
  (auth)/
    login.tsx           Email/password sign-in + password reset
  (app)/                Protected area (Stack.Protected guard={!!user})
    _layout.tsx          Bottom tabs: Dashboard, Members, Donations, Events, Reports
    dashboard.tsx
    members/             List, add, and detail/edit/delete screens (Firestore-backed)
    donations/
    events/
    reports.tsx
src/
  context/AuthContext.tsx  Firebase auth session as a React Context
  firebase/config.ts       Firebase app/auth/firestore initialization
  firebase/firestore.ts     Generic useCollection/useDocument hooks + CRUD helpers
  components/               Shared UI: FormField, PrimaryButton, EmptyState, LoadingScreen
  types/                     Domain types (Member, Donation, EventItem)
```

## 1. Firebase setup (required before login will work)

1. Create a project at https://console.firebase.google.com.
2. Enable **Authentication → Sign-in method → Email/Password**.
3. Create a **Firestore Database** (start in production mode) and deploy the
   rules in `firestore.rules` (requires any signed-in user for read/write —
   tighten as needed for your real access model).
4. Add a **Web app** in Project Settings to get your config values.
5. Copy `.env.example` to `.env` and fill in the values:

   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=...
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   EXPO_PUBLIC_FIREBASE_APP_ID=...
   EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=...
   ```

6. Create at least one user (Firebase Console → Authentication → Users → Add
   user) to sign in with — this app does not expose public self-registration.

Without a `.env` file, the app still boots and shows the Login screen with a
visible "Firebase is not configured" banner instead of crashing or hanging.

## 2. Install and run

```bash
npm install
npx expo start          # Expo Go / dev client
npx expo start --android
npx expo start --ios
npx expo start --web
```

## 3. Type checking

```bash
npm run typecheck
```

## 4. Building for Android / APK

```bash
npm install -g eas-cli
eas login
eas init                # links this project to an EAS project (writes extra.eas.projectId)

# Internal-distribution APK you can sideload directly:
eas build --platform android --profile preview

# Play Store app bundle:
eas build --platform android --profile production
```

`eas.json` already defines `preview` (APK) and `production` (AAB) profiles.

### Local (no EAS) native build

```bash
npx expo prebuild --platform android
cd android && ./gradlew assembleDebug
```

## Notes on package versions

Dependency versions were taken directly from Expo's own compatibility map
(`bundledNativeModules.json`) for SDK 57, generated via the official
`create-expo-app` CLI rather than hand-picked, so the whole set is
mutually compatible with this Expo/React Native/React combination.

`firebase/auth`'s package `exports` map resolves its `types` condition
before the `react-native` condition, so TypeScript can't see
`getReactNativePersistence` even though Metro resolves the correct runtime
build. `src/types/firebase-auth.d.ts` adds a small module augmentation to
restore that type; it has no effect on the actual runtime module Metro loads.
