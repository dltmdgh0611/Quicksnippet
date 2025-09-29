import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface HealthCheckRecord {
  user_email: string;
  team_id: string;
  snippet_date: string;
  content: string;
  rating: number;
  created_at: string;
}

const DATA_FILE = path.join(process.cwd(), 'data', 'health-checks.json');

// Read existing data
const readData = (): HealthCheckRecord[] => {
  if (!fs.existsSync(DATA_FILE)) {
    return [];
  }
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading health check data:', error);
    return [];
  }
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const teamId = searchParams.get('team_id');

  if (!teamId) {
    return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
  }

  try {
    const allData = readData();
    
    // Filter by team ID
    const teamData = allData.filter(record => record.team_id === teamId);
    
    // Transform to match frontend interface
    const transformedData = teamData.map(record => ({
      user_email: record.user_email,
      snippet_date: record.snippet_date,
      rating: record.rating,
      content: record.content
    }));

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Failed to fetch team health data:', error);
    return NextResponse.json({ error: 'Failed to fetch team health data' }, { status: 500 });
  }
}
