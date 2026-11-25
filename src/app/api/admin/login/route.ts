export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, key] = storedHash.split(':');
  if (!salt || !key) return false;
  const keyBuffer = Buffer.from(key, 'hex');
  const derivedBuffer = crypto.scryptSync(password, salt, 64);
  if (keyBuffer.length !== derivedBuffer.length) return false;
  return crypto.timingSafeEqual(keyBuffer, derivedBuffer);
}

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Mot de passe administrateur incorrect.' },
        { status: 401 }
      );
    }

    const setting = await prisma.adminSetting.findUnique({
      where: { id: 'default' },
    });

    let isValid = false;
    if (setting?.passwordHash) {
      isValid = verifyPassword(password, setting.passwordHash);
    } else {
      const expectedPassword = process.env.ADMIN_PASSWORD || 'admin1234';
      isValid = password === expectedPassword;
    }

    if (!isValid) {
      return NextResponse.json(
        { error: 'Mot de passe administrateur incorrect.' },
        { status: 401 }
      );
    }

    cookies().set({
      name: ADMIN_COOKIE_NAME,
      value: 'authenticated_admin_jumia',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json(
      { success: true, message: 'Authentification réussie.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur connexion admin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la tentative de connexion.' },
      { status: 500 }
    );
  }
}

