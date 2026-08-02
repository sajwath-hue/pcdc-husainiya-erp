# Al Husainiya ERP

A React Native app built with Expo SDK 57, Expo Router, TypeScript, and Supabase
(Auth + Postgres) for managing Members, Donations, and Events.

## Stack

- Expo SDK 57 / React Native 0.86 / React 19.2
- Expo Router 57 (file-based navigation, `Stack.Protected` auth guards)
- TypeScript (strict mode)
- Supabase JS v2 (Auth with AsyncStorage session persistence, Postgres via PostgREST + Realtime)
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
    members/             List, add, and detail/edit/delete screens (Supabase-backed)
    donations/
    events/
    reports.tsx
src/
  context/AuthContext.tsx  Supabase auth session as a React Context
  supabase/config.ts        Supabase client init (AsyncStorage session persistence)
  supabase/data.ts           Generic useCollection/useDocument hooks + CRUD helpers
  supabase/case.ts            camelCase (app) <-> snake_case (Postgres) mapping
  components/               Shared UI: FormField, PrimaryButton, EmptyState, LoadingScreen
  types/                     Domain types (Member, Donation, EventItem)
```

## 1. Backend

This app shares a Supabase project with another business (`epoch-venture-erp`,
a precast concrete manufacturing company) to stay within the free-tier project
limit. Data is kept isolated via table naming, not a separate project:

- `husainiya_members`
- `husainiya_donations`
- `husainiya_events`

All three have Row Level Security enabled with a policy allowing any
**authenticated** user full read/write access (no public/anonymous access).
Realtime is enabled on all three tables so list screens update live across
devices.

`.env` already contains the real project URL and anon/publishable key — both
are safe to expose client-side (Supabase's own guidance: "Publishable keys
can be safely shared publicly"), access is enforced by RLS, not by hiding
the key. Do **not** ever put the `sb_secret_...` service-role key in this
app; that one bypasses RLS entirely and must stay server-side only.

To sign in, create a user in the Supabase dashboard: **Authentication → Users
→ Add user**. This app does not expose public self-registration.

Without a `.env` file, the app still boots and shows the Login screen with a
visible "Supabase is not configured" banner instead of crashing or hanging.

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
