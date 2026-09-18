import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDummyApiKeyForFirebaseConfig",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "nexus-digital-marketing-agency.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nexus-digital-marketing-agency",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "nexus-digital-marketing-agency.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "382649737772",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:382649737772:web:b75d1b667cbd127cb02789",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
// Long-lived sessions: keep the user signed in across page reloads, tab
// closes, browser restarts and network drops. Storage-backed (IndexedDB)
// persistence — only an explicit logout clears it.
setPersistence(auth, browserLocalPersistence).catch(() => {
  /* Private-mode browsers may block storage — SDK falls back gracefully */
});

// Initialize Firestore with long-polling to eliminate WebChannel RPC transport errors.
// WebChannel (WebSocket upgrade) is frequently blocked by localhost dev servers,
// VPNs, corporate firewalls, and browser extensions. Long-polling is a reliable
// HTTP fallback that removes the "transport errored" console warnings entirely.
// persistentLocalCache enables multi-tab IndexedDB caching for offline resilience.
let db: ReturnType<typeof getFirestore>;
try {
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    experimentalForceLongPolling: true,
  });
} catch {
  // Already initialized (e.g. hot-module reload in dev) — reuse the existing instance.
  db = getFirestore(app);
}
export { db };

// Configure Google Provider with proper scopes and settings
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("profile");
googleProvider.addScope("email");
// Set custom parameters for better UX (prompt for account selection)
googleProvider.setCustomParameters({
  prompt: "select_account",
  access_type: "online",
});

export {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  onAuthStateChanged,
  type User,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
};
