import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  updateDoc
} from 'firebase/firestore';

interface UserData {
  email: string;
  team_id: string;
  created_at: string;
  updated_at: string;
}

// 재시도 로직을 위한 헬퍼 함수
async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 100  // 1초 → 100ms로 단축
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      console.error(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      const waitTime = delayMs * Math.pow(1.5, attempt - 1);  // 지수 백오프 완화
      console.log(`Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  throw new Error('Max retries exceeded');
}

// 팀 참여 API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_email, team_id } = body;

    if (!user_email || !team_id) {
      return NextResponse.json(
        { error: '사용자 이메일과 팀 ID가 필요합니다' },
        { status: 400 }
      );
    }

    // Firebase 환경 변수 확인
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
      console.error('Missing Firebase environment variables:', missingEnvVars);
      return NextResponse.json(
        { 
          error: 'Firebase 설정이 완료되지 않았습니다. 환경 변수를 확인해주세요.',
          missingVars: missingEnvVars
        },
        { status: 500 }
      );
    }

    // 사용자 데이터 저장/업데이트
    await retryOperation(async () => {
      const userDocRef = doc(db, 'users', user_email);
      const userDoc = await getDoc(userDocRef);
      
      const now = new Date().toISOString();
      
      if (userDoc.exists()) {
        // 기존 사용자 - 팀 ID 업데이트
        await updateDoc(userDocRef, {
          team_id: team_id,
          updated_at: now
        });
        console.log(`Updated team for user: ${user_email}`);
      } else {
        // 새 사용자 - 데이터 생성
        const userData: UserData = {
          email: user_email,
          team_id: team_id,
          created_at: now,
          updated_at: now
        };
        await setDoc(userDocRef, userData);
        console.log(`Created new user: ${user_email}`);
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: '팀 참여가 완료되었습니다!',
      team_id: team_id
    });
  } catch (error: any) {
    console.error('Error joining team:', error);
    
    let errorMessage = '팀 참여에 실패했습니다';
    if (error.code) {
      switch (error.code) {
        case 'permission-denied':
          errorMessage = '권한이 없습니다. Firestore 보안 규칙을 확인해주세요.';
          break;
        case 'unavailable':
          errorMessage = '서비스가 일시적으로 사용할 수 없습니다.';
          break;
        case 'unauthenticated':
          errorMessage = '인증에 실패했습니다. Firebase 설정을 확인해주세요.';
          break;
        default:
          errorMessage = `Firestore 오류: ${error.code}`;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message,
        code: error.code
      },
      { status: 500 }
    );
  }
}

// 사용자 데이터 조회 API
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const user_email = searchParams.get('user_email');

  if (!user_email) {
    return NextResponse.json({ error: '사용자 이메일이 필요합니다' }, { status: 400 });
  }

  try {
    // Firebase 환경 변수 확인
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID'
    ];
    
    const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
    if (missingEnvVars.length > 0) {
      console.error('Missing Firebase environment variables:', missingEnvVars);
      return NextResponse.json(
        { 
          error: 'Firebase 설정이 완료되지 않았습니다. 환경 변수를 확인해주세요.',
          missingVars: missingEnvVars
        },
        { status: 500 }
      );
    }

    // 사용자 데이터 조회
    const userData = await retryOperation(async () => {
      const userDocRef = doc(db, 'users', user_email);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return {
          email: data.email,
          team_id: data.team_id,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
      } else {
        return null;
      }
    });

    if (userData) {
      return NextResponse.json(userData);
    } else {
      return NextResponse.json(
        { error: '사용자 데이터를 찾을 수 없습니다' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error('Failed to fetch user data:', error);
    
    let errorMessage = '사용자 데이터 조회에 실패했습니다';
    if (error.code) {
      switch (error.code) {
        case 'permission-denied':
          errorMessage = '권한이 없습니다. Firestore 보안 규칙을 확인해주세요.';
          break;
        case 'unavailable':
          errorMessage = '서비스가 일시적으로 사용할 수 없습니다.';
          break;
        case 'unauthenticated':
          errorMessage = '인증에 실패했습니다. Firebase 설정을 확인해주세요.';
          break;
        default:
          errorMessage = `Firestore 오류: ${error.code}`;
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error.message,
        code: error.code
      }, 
      { status: 500 }
    );
  }
}
