// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// If you need Firebase Auth:
import { getAuth } from "firebase/auth";

// Optional Debug Logs (check DevTools → Console to ensure these aren't undefined)
console.log("FIREBASE_API_KEY:", process.env.REACT_APP_FIREBASE_API_KEY);
console.log("FIREBASE_AUTH_DOMAIN:", process.env.REACT_APP_FIREBASE_AUTH_DOMAIN);
console.log("FIREBASE_PROJECT_ID:", process.env.REACT_APP_FIREBASE_PROJECT_ID);
console.log("FIREBASE_STORAGE_BUCKET:", process.env.REACT_APP_FIREBASE_STORAGE_BUCKET);
console.log("FIREBASE_MESSAGING_SENDER_ID:", process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID);
console.log("FIREBASE_APP_ID:", process.env.REACT_APP_FIREBASE_APP_ID);
console.log("FIREBASE_MEASUREMENT_ID:", process.env.REACT_APP_FIREBASE_MEASUREMENT_ID);

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "YOUR_FALLBACK_API_KEY",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "YOUR_FALLBACK_AUTH_DOMAIN",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "YOUR_FALLBACK_PROJECT_ID",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "YOUR_FALLBACK_STORAGE_BUCKET",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "YOUR_FALLBACK_SENDER_ID",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "YOUR_FALLBACK_APP_ID",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "YOUR_FALLBACK_MEASUREMENT_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export auth if you need Firebase Authentication
export const auth = getAuth(app);

// Export the initialized app (optional, if other files need it)
export default app;
