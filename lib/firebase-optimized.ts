// Firebase 최적화된 사용 예시
import { 
  getAuthInstance, 
  getFirestoreInstance, 
  getAnalyticsInstance,
  getGoogleProvider 
} from './firebase';

// 최적화된 Firebase 훅들
export const useFirebaseAuth = () => {
  const auth = getAuthInstance();
  return auth;
};

export const useFirestore = () => {
  const db = getFirestoreInstance();
  return db;
};

export const useAnalytics = () => {
  const analytics = getAnalyticsInstance();
  return analytics;
};

export const useGoogleAuth = () => {
  const provider = getGoogleProvider();
  return provider;
};

// Firebase 초기화 상태 확인
export const isFirebaseInitialized = () => {
  try {
    getAuthInstance();
    return true;
  } catch {
    return false;
  }
};

// 지연 로딩을 위한 Firebase 모듈 로더
export const loadFirebaseModule = async (moduleName: string) => {
  switch (moduleName) {
    case 'auth':
      return import('firebase/auth');
    case 'firestore':
      return import('firebase/firestore');
    case 'analytics':
      return import('firebase/analytics');
    case 'storage':
      return import('firebase/storage');
    default:
      throw new Error(`Unknown Firebase module: ${moduleName}`);
  }
};
