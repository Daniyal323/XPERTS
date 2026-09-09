import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { initializeAuth, browserLocalPersistence, inMemoryPersistence } from "firebase/auth";
import { initializeFirestore, memoryLocalCache } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;
// WKWebView stalls on IndexedDB, so the default Auth persistence (which tries
// indexedDBLocalPersistence first) hangs on init — the same reason Firestore
// below uses memoryLocalCache. Force localStorage persistence, which works in
// the webview and keeps the user signed in across launches, with an in-memory
// fallback. Must use initializeAuth (not getAuth) to override the default.
const auth = initializeAuth(app, {
  persistence: [browserLocalPersistence, inMemoryPersistence],
});
const db = initializeFirestore(app, {
  // Drop undefined fields (incl. nested) instead of throwing, so optional
  // fields can be passed through without hand-pruning every object.
  ignoreUndefinedProperties: true,
  // CRITICAL for the Capacitor / iOS WKWebView build. Two things hang Firestore
  // inside WKWebView and must both be neutralized, or auth succeeds and the app
  // then freezes on the first Firestore read/write:
  //  1) the default WebChannel streaming transport never connects in WKWebView
  //     → force long-polling (plain HTTP requests, work reliably in the webview).
  //  2) the default IndexedDB persistence layer can stall in WKWebView
  //     → use an in-memory cache so there is no IndexedDB dependency.
  // Both are harmless in a normal browser.
  experimentalForceLongPolling: true,
  localCache: memoryLocalCache(),
});

export { app, analytics, auth, db };
