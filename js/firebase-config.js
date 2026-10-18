/**
 * IT World — Firebase Configuration Module
 * 
 * Provides centralized configuration for Firebase Realtime Database.
 * 
 * INSTRUCTIONS FOR SETUP:
 * 1. Go to the Firebase Console: https://console.firebase.google.com/
 * 2. Select or create your Firebase project (e.g., "it-world-website").
 * 3. Go to Project Settings > General > "Your apps" > Add Web App (</>).
 * 4. Copy your firebaseConfig object and replace the placeholder values below.
 * 5. In Firebase Console, go to Build > Realtime Database and create a database
 *    (select a region, e.g. Singapore / asia-southeast1 or us-central1).
 * 6. Deploy the rules from database.rules.json in your Realtime Database > Rules tab.
 * 
 * NOTE: As per project requirements, do not hardcode private credentials or Admin SDK
 * secrets in frontend code. Public Firebase Web configuration keys are designed for
 * client initialization and are secured via Realtime Database Security Rules.
 */

// Replace these placeholders with your actual Firebase project settings
export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "it-world-careers.firebaseapp.com",
  databaseURL: "https://it-world-careers-default-rtdb.firebaseio.com",
  projectId: "it-world-careers",
  storageBucket: "it-world-careers.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

/**
 * Checks whether Firebase configuration has been customized with real credentials.
 * Returns false if still using the initial placeholders.
 */
export function isFirebaseConfigured() {
  return (
    Boolean(firebaseConfig) &&
    Boolean(firebaseConfig.apiKey) &&
    firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY" &&
    Boolean(firebaseConfig.databaseURL) &&
    !firebaseConfig.databaseURL.includes("YOUR_PROJECT_ID") &&
    firebaseConfig.databaseURL !== "https://it-world-careers-default-rtdb.firebaseio.com"
  );
}

// Global fallback for non-module script contexts
if (typeof window !== 'undefined') {
  window.IT_WORLD_FIREBASE_CONFIG = firebaseConfig;
  window.isFirebaseConfigured = isFirebaseConfigured;
}
