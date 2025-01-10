// Import the necessary Firebase functions
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// If you are using analytics, import it; otherwise, you can omit it.
import { getAnalytics } from "firebase/analytics";

// Firebase configuration for your web app
const firebaseConfig = {
  apiKey: "AIzaSyCIxnopNqYWDR66WQwxBt0dqPs1Ma9M_JY",
  authDomain: "vipspot-web-page.firebaseapp.com",
  projectId: "vipspot-web-page",
  storageBucket: "vipspot-web-page.appspot.com", // Fixed the storage bucket URL
  messagingSenderId: "894947411062",
  appId: "1:894947411062:web:f1b376e038dab9f6d00b57",
  measurementId: "G-6CCCTC0NNE",
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and export it
export const auth = getAuth(app);

// Optional: Initialize Firebase Analytics (only if you need it)
const analytics = getAnalytics(app);

// Export Firebase App (optional if you need access to it elsewhere)
export default app;
