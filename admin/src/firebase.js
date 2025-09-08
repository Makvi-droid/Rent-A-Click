// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "@firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDwP2qdqYZ6FgvOCeXhUiKEA9QHpMII_7Y",
  authDomain: "rent-a-click.firebaseapp.com",
  projectId: "rent-a-click",
  storageBucket: "rent-a-click.firebasestorage.app",
  messagingSenderId: "1039411448942",
  appId: "1:1039411448942:web:1cf8bf04e022d09a086a7f",
  measurementId: "G-39QC614LCF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const firestore = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, analytics, firestore, auth, storage };