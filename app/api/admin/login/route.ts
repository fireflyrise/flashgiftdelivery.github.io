import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    const user = await authenticateAdmin(username, password);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    await createSession(user.id, user.username);

    return NextResponse.json({ success: true, username: user.username });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
