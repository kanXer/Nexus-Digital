import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  signOut,
  onAuthStateChanged,
  type User,
} from "firebase/auth";
import {
  getFirestore,
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
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
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
