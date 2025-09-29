import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  doc,
  updateDoc,
  getDoc
} from 'firebase/firestore';

interface HealthCheckRecord {
  user_email: string;
  team_id: string;
  snippet_date: string;
  content: string;
  rating: number;
  created_at: string;
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
      
      // 지수 백오프 완화 (2 → 1.5)
      const waitTime = delayMs * Math.pow(1.5, attempt - 1);
      console.log(`Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  throw new Error('Max retries exceeded');
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_email, team_id, snippet_date, content, rating } = body;

    if (!user_email || !team_id || !snippet_date || !content || rating === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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
          error: 'Firebase configuration is incomplete. Please check environment variables.',
          missingVars: missingEnvVars
        },
        { status: 500 }
      );
    }

    const newRecord: HealthCheckRecord = {
      user_email,
      team_id,
      snippet_date,
      content,
      rating,
      created_at: new Date().toISOString()
    };

    // 재시도 로직과 함께 Firestore 작업 실행
    await retryOperation(async () => {
      // Check if record already exists for this user and date
      const healthChecksRef = collection(db, 'healthChecks');
      const q = query(
        healthChecksRef,
        where('user_email', '==', user_email),
        where('snippet_date', '==', snippet_date)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Update existing record
        const docRef = querySnapshot.docs[0].ref;
        await updateDoc(docRef, newRecord as any);
        console.log('Updated existing health check record');
      } else {
        // Add new record
        await addDoc(healthChecksRef, newRecord as any);
        console.log('Added new health check record');
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Health check data saved successfully'
    });
  } catch (error: any) {
    console.error('Error saving health check:', error);
    
    // 구체적인 에러 메시지 제공
    let errorMessage = 'Failed to save health check data';
    if (error.code) {
      switch (error.code) {
        case 'permission-denied':
          errorMessage = 'Permission denied. Check Firestore security rules.';
          break;
        case 'unavailable':
          errorMessage = 'Firestore service is temporarily unavailable.';
          break;
        case 'unauthenticated':
          errorMessage = 'Authentication failed. Check Firebase configuration.';
          break;
        case 'invalid-argument':
          errorMessage = 'Invalid data format. Check the data being saved.';
          break;
        default:
          errorMessage = `Firestore error: ${error.code}`;
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('team_id');

  if (!teamId) {
    return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
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
          error: 'Firebase configuration is incomplete. Please check environment variables.',
          missingVars: missingEnvVars
        },
        { status: 500 }
      );
    }

    // 재시도 로직과 함께 Firestore 작업 실행
    const transformedData = await retryOperation(async () => {
      const healthChecksRef = collection(db, 'healthChecks');
      const q = query(
        healthChecksRef,
        where('team_id', '==', teamId),
        orderBy('snippet_date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      
      // Transform to match frontend interface
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          user_email: data.user_email,
          snippet_date: data.snippet_date,
          rating: data.rating,
          content: data.content
        };
      });
    });

    return NextResponse.json(transformedData);
  } catch (error: any) {
    console.error('Failed to fetch team health data:', error);
    
    // 구체적인 에러 메시지 제공
    let errorMessage = 'Failed to fetch team health data';
    if (error.code) {
      switch (error.code) {
        case 'permission-denied':
          errorMessage = 'Permission denied. Check Firestore security rules.';
          break;
        case 'unavailable':
          errorMessage = 'Firestore service is temporarily unavailable.';
          break;
        case 'unauthenticated':
          errorMessage = 'Authentication failed. Check Firebase configuration.';
          break;
        default:
          errorMessage = `Firestore error: ${error.code}`;
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
