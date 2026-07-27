import type { Persistence } from 'firebase/auth';

// firebase/auth's package.json "exports" map resolves the "types" condition
// before the "react-native" condition, so tsc never picks up the React Native
// build's types even though Metro resolves the correct implementation at
// runtime. This augmentation restores the missing type for `tsc --noEmit`.
declare module 'firebase/auth' {
  export function getReactNativePersistence(storage: unknown): Persistence;
}
