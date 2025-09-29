// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDkYtGkBbWkh9PW2tJebQGtPkVp_DP0J2Y",
  authDomain: "quicksnippet-35f2a.firebaseapp.com",
  projectId: "quicksnippet-35f2a",
  storageBucket: "quicksnippet-35f2a.firebasestorage.app",
  messagingSenderId: "388571021839",
  appId: "1:388571021839:web:381d1c5501375e98d7197a",
  measurementId: "G-5DVSNZZYPQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Auth 인스턴스 생성
export const auth = getAuth(app);

// Google Auth Provider 생성
export const googleProvider = new GoogleAuthProvider();

export { analytics };
export default app;
