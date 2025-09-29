// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, collection, getDocs, query, limit } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Firebase 설정 검증
const validateFirebaseConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration fields:', missingFields);
    throw new Error(`Firebase configuration is incomplete. Missing: ${missingFields.join(', ')}`);
  }
};

// Initialize Firebase
let app;
try {
  validateFirebaseConfig();
  app = initializeApp(firebaseConfig);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Failed to initialize Firebase:', error);
  throw error;
}

// Initialize Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
    console.log('Firebase Analytics initialized');
  } catch (error) {
    console.warn('Failed to initialize Analytics:', error);
  }
}

// Auth 인스턴스 생성
export const auth = getAuth(app);

// Google Auth Provider 생성
export const googleProvider = new GoogleAuthProvider();

// Firestore 인스턴스 생성
export const db = getFirestore(app);

// Firestore 연결 상태 확인 함수
export const checkFirestoreConnection = async () => {
  try {
    // 간단한 테스트 쿼리로 연결 상태 확인
    const testRef = collection(db, 'healthChecks');
    await getDocs(query(testRef, limit(1)));
    console.log('Firestore connection is healthy');
    return true;
  } catch (error) {
    console.error('Firestore connection failed:', error);
    return false;
  }
};

export { analytics };
export default app;
