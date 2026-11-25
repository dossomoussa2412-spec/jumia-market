import { cookies } from 'next/headers';

const ADMIN_COOKIE_NAME = 'jumia_admin_auth';

export function verifyAdminSession(): boolean {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!sessionCookie || !sessionCookie.value) {
    return false;
  }
  // Cookie token validé
  return sessionCookie.value === 'authenticated_admin_jumia';
}

export { ADMIN_COOKIE_NAME };
