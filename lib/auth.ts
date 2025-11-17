import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from './supabase-admin';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production'
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string, username: string) {
  const token = await new SignJWT({ userId, username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(SECRET_KEY);

  (await cookies()).set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/',
  });

  return token;
}

export async function getSession() {
  const token = (await cookies()).get('admin_session')?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as { userId: string; username: string };
  } catch (error) {
    return null;
  }
}

export async function deleteSession() {
  (await cookies()).delete('admin_session');
}

export async function authenticateAdmin(username: string, password: string) {
  const { data: user, error } = await supabaseAdmin
    .from('admin_users')
    .select('*')
    .eq('username', username)
    .eq('is_active', true)
    .single();

  if (error || !user) {
    console.error('User lookup error:', error);
    return null;
  }

  const isValid = await verifyPassword(password, user.password_hash);

  if (!isValid) {
    console.error('Password verification failed');
    return null;
  }

  // Update last login
  await supabaseAdmin
    .from('admin_users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', user.id);

  return user;
}
