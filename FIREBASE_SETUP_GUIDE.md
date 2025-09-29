# Firebase 환경 변수 설정 가이드

## 문제 해결: RPC write stream error

RPC write stream error가 발생하는 주요 원인은 Firebase 환경 변수가 설정되지 않았기 때문입니다.

## 해결 방법

### 1. 환경 변수 파일 생성
프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가하세요:

```env
# Firebase Configuration
# Firebase Console에서 프로젝트 설정 > 일반 > 웹 앱에서 확인할 수 있습니다
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 2. Firebase Console에서 설정 값 확인
1. [Firebase Console](https://console.firebase.google.com/)에 접속
2. 프로젝트 선택
3. 프로젝트 설정 > 일반 탭
4. 웹 앱 섹션에서 설정 값 복사

### 3. Firestore 보안 규칙 확인
Firestore Database > 규칙 탭에서 다음 규칙이 설정되어 있는지 확인:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 개발 환경용 - 모든 읽기/쓰기 허용
    match /{document=**} {
      allow read, write: if true;
    }
    
    // 또는 더 구체적인 규칙 (권장)
    match /healthChecks/{document} {
      allow read, write: if true; // 개발용
    }
    
    // 사용자 데이터 규칙
    match /users/{userId} {
      allow read, write: if true; // 개발용 - 프로덕션에서는 인증된 사용자만
    }
  }
}
```

### 4. 서버 재시작
환경 변수 설정 후 개발 서버를 재시작하세요:
```bash
npm run dev
# 또는
yarn dev
```

## 개선된 기능

### 1. 자동 재시도 로직
- Firestore 작업 실패 시 최대 3회까지 자동 재시도
- 지수 백오프 방식으로 재시도 간격 증가 (1초, 2초, 4초)

### 2. 상세한 에러 메시지
- 환경 변수 누락 감지
- Firebase 연결 상태 확인
- 구체적인 에러 코드별 메시지 제공

### 3. 연결 상태 모니터링
- Firestore 연결 상태를 주기적으로 확인
- 연결 실패 시 적절한 에러 메시지 표시

## 에러 코드별 해결 방법

- `permission-denied`: Firestore 보안 규칙 확인
- `unavailable`: 네트워크 연결 및 Firebase 서비스 상태 확인
- `unauthenticated`: Firebase 설정 및 인증 확인
- `invalid-argument`: 데이터 형식 및 필드 검증

## 추가 디버깅

개발자 도구 콘솔에서 다음 로그를 확인할 수 있습니다:
- Firebase 초기화 상태
- Firestore 연결 상태
- 재시도 시도 횟수
- 상세한 에러 정보
