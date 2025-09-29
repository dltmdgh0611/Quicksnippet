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

    // Check if record already exists for this user and date
    const healthChecksRef = collection(db, 'healthChecks');
    const q = query(
      healthChecksRef,
      where('user_email', '==', user_email),
      where('snippet_date', '==', snippet_date)
    );
    
    const querySnapshot = await getDocs(q);
    
    const newRecord: HealthCheckRecord = {
      user_email,
      team_id,
      snippet_date,
      content,
      rating,
      created_at: new Date().toISOString()
    };

    if (!querySnapshot.empty) {
      // Update existing record
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, newRecord as any);
    } else {
      // Add new record
      await addDoc(healthChecksRef, newRecord as any);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Health check data saved successfully'
    });
  } catch (error) {
    console.error('Error saving health check:', error);
    return NextResponse.json(
      { error: 'Failed to save health check data' },
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
    const healthChecksRef = collection(db, 'healthChecks');
    const q = query(
      healthChecksRef,
      where('team_id', '==', teamId),
      orderBy('snippet_date', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    // Transform to match frontend interface
    const transformedData = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        user_email: data.user_email,
        snippet_date: data.snippet_date,
        rating: data.rating,
        content: data.content
      };
    });

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Failed to fetch team health data:', error);
    return NextResponse.json({ error: 'Failed to fetch team health data' }, { status: 500 });
  }
}
