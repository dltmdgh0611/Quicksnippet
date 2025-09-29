// Import the functions you need from the SDKs you need
import { initializeApp, getApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, collection, getDocs, query, limit } from "firebase/firestore";

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

// 지연 초기화를 위한 변수들
let firebaseApp: any = null;
let authInstance: any = null;
let dbInstance: any = null;
let analyticsInstance: any = null;
let googleProviderInstance: any = null;

// Firebase 앱 초기화 함수 (지연 로딩)
const initializeFirebaseApp = () => {
  if (firebaseApp) return firebaseApp;
  
  try {
    validateFirebaseConfig();
    firebaseApp = initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
    return firebaseApp;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
};

// Auth 인스턴스 지연 초기화
export const getAuthInstance = () => {
  if (!authInstance) {
    const app = initializeFirebaseApp();
    authInstance = getAuth(app);
  }
  return authInstance;
};

// Google Auth Provider 지연 초기화
export const getGoogleProvider = () => {
  if (!googleProviderInstance) {
    googleProviderInstance = new GoogleAuthProvider();
  }
  return googleProviderInstance;
};

// Firestore 인스턴스 지연 초기화
export const getFirestoreInstance = () => {
  if (!dbInstance) {
    const app = initializeFirebaseApp();
    dbInstance = getFirestore(app);
  }
  return dbInstance;
};

// Analytics 지연 초기화 (브라우저 환경에서만)
export const getAnalyticsInstance = () => {
  if (typeof window === 'undefined') return null;
  
  if (!analyticsInstance) {
    try {
      const app = initializeFirebaseApp();
      analyticsInstance = getAnalytics(app);
      console.log('Firebase Analytics initialized');
    } catch (error) {
      console.warn('Failed to initialize Analytics:', error);
    }
  }
  return analyticsInstance;
};

// 기존 호환성을 위한 export (지연 초기화)
export const auth = getAuthInstance();
export const googleProvider = getGoogleProvider();
export const db = getFirestoreInstance();

// Firestore 연결 상태 확인 함수 (최적화됨)
export const checkFirestoreConnection = async () => {
  try {
    const firestoreInstance = getFirestoreInstance();
    // 더 가벼운 테스트 쿼리로 연결 상태 확인
    const testRef = collection(firestoreInstance, 'healthChecks');
    await getDocs(query(testRef, limit(1)));
    console.log('Firestore connection is healthy');
    return true;
  } catch (error) {
    console.error('Firestore connection failed:', error);
    return false;
  }
};

// 앱 인스턴스 지연 초기화
export const getAppInstance = () => {
  return initializeFirebaseApp();
};

// 기존 호환성을 위한 export
export { analyticsInstance as analytics };
export default getAppInstance;
