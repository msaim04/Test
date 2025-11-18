/**
 * Firebase Configuration
 * Initialize Firebase with your project configuration
 */

import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAnalytics, Analytics } from "firebase/analytics";
import { getAuth, Auth, GoogleAuthProvider } from "firebase/auth";

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB36Ya_Da33NGM_p6IkjXuyKELhe2Nyi_g",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "servisca-fdeaa.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "servisca-fdeaa",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "servisca-fdeaa.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "160380363975",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:160380363975:web:1c5ffb93f39da3b7570ae2",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XF0ZY4KEES",
};

// Initialize Firebase (only if not already initialized)
let app: FirebaseApp;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Initialize Analytics (only in browser environment)
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

// Initialize Auth
let auth: Auth | null = null;
if (typeof window !== "undefined") {
  auth = getAuth(app);
}

// Google Auth Provider with account selection
const googleAuthProvider = new GoogleAuthProvider();
// Force account selection - shows account picker every time
googleAuthProvider.setCustomParameters({
  prompt: 'select_account',
});

export { app, analytics, auth, googleAuthProvider };
export default app;

