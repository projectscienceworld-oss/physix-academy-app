import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, browserLocalPersistence, getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "dummy_api_key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "dummy_auth_domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "dummy_project_id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "dummy_storage_bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "dummy_messaging_sender_id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "dummy_app_id",
};

// Track whether the app was already initialized before this module ran
const alreadyInitialized = getApps().length > 0;

// Prevent re-initializing on hot reload
const app = alreadyInitialized ? getApp() : initializeApp(firebaseConfig);

// Use browserLocalPersistence to fix Google Sign-In in Capacitor Android WebView.
// This stores auth state in localStorage instead of sessionStorage,
// preventing "missing initial state" errors on OAuth redirects.
// Only call initializeAuth once (on first init); use getAuth on subsequent module loads.
export const auth = alreadyInitialized
  ? getAuth(app)
  : initializeAuth(app, { persistence: browserLocalPersistence });
export const db = getFirestore(app);
export default app;
