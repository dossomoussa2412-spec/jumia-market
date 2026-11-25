export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    cookies().delete(ADMIN_COOKIE_NAME);
    return NextResponse.json({ success: true, message: 'DÃ©connexion effectuÃ©e.' });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la dÃ©connexion.' }, { status: 500 });
  }
}

