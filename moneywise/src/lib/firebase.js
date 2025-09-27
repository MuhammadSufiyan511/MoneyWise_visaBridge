// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getDatabase } from 'firebase/database'; // <-- add this

// const firebaseConfig = {
//   apiKey: "AIzaSyCqPcikw211ClgJitlXn_-d7EOc8mIIBeY",
//   authDomain: "moneywise-cd164.firebaseapp.com",
//   projectId: "moneywise-cd164",
//   storageBucket: "moneywise-cd164.appspot.com", // ✅ FIXED
//   messagingSenderId: "607625937692",
//   appId: "1:607625937692:web:1c343cbc9194d9be96f0d9",
//   measurementId: "G-FNYVGYCT6K"
// };

// const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app);
// export const rdb = getDatabase(app); 


// export default app;


// src/lib/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";


// src/firebaseConfig.js
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};


const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);

// Firestore (export as `db`)
export const db = getFirestore(app);

// Enable offline persistence (best-effort)
// If persistence cannot be enabled (multi-tab or unsupported browser), catch the error.
enableIndexedDbPersistence(db).catch((err) => {
  // Fallback is fine — Firestore will still work online
  console.warn("Firestore persistence not enabled:", err?.code || err);
});

// Optional: Cloud Storage for receipts
export const storage = getStorage(app);

// Export default app in case some dev tools expect it
export default app;
