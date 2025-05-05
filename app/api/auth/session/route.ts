import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

// GET /api/auth/session - Return current session information
export async function GET() {
  try {
    const session = await getSession();
    
    return NextResponse.json({
      session,
      authenticated: !!session?.user,
    });
  } catch (error) {
    console.error('Error in session API route:', error);
    return NextResponse.json(
      { error: 'Failed to get session' },
      { status: 500 }
    );
  }
} 