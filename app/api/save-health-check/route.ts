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

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
};

// Read existing data
const readData = (): HealthCheckRecord[] => {
  ensureDataDir();
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

// Write data
const writeData = (data: HealthCheckRecord[]) => {
  ensureDataDir();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing health check data:', error);
    throw error;
  }
};

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

    const existingData = readData();
    
    // Check if record already exists for this user and date
    const existingIndex = existingData.findIndex(
      record => record.user_email === user_email && record.snippet_date === snippet_date
    );

    const newRecord: HealthCheckRecord = {
      user_email,
      team_id,
      snippet_date,
      content,
      rating,
      created_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      // Update existing record
      existingData[existingIndex] = newRecord;
    } else {
      // Add new record
      existingData.push(newRecord);
    }

    writeData(existingData);

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
