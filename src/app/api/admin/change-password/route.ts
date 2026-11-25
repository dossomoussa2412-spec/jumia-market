import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { ADMIN_COOKIE_NAME } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/app/api/admin/login/route';

export async function POST(request: Request) {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get(ADMIN_COOKIE_NAME);

    if (!session || session.value !== 'authenticated_admin_jumia') {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous reconnecter.' },
        { status: 401 }
      );
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword || typeof newPassword !== 'string') {
      return NextResponse.json(
        { error: 'Veuillez renseigner le mot de passe actuel et le nouveau.' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Le nouveau mot de passe doit contenir au moins 6 caractères.' },
        { status: 400 }
      );
    }

    const setting = await prisma.adminSetting.findUnique({
      where: { id: 'default' },
    });

    const isCurrentValid = setting?.passwordHash
      ? verifyPassword(currentPassword, setting.passwordHash)
      : currentPassword === (process.env.ADMIN_PASSWORD || 'admin1234');

    if (!isCurrentValid) {
      return NextResponse.json(
        { error: 'Le mot de passe actuel est incorrect.' },
        { status: 400 }
      );
    }

    const newHash = hashPassword(newPassword);

    await prisma.adminSetting.upsert({
      where: { id: 'default' },
      update: { passwordHash: newHash },
      create: { id: 'default', passwordHash: newHash },
    });

    return NextResponse.json({
      success: true,
      message: 'Mot de passe mis à jour avec succès.',
    });
  } catch (error) {
    console.error('Erreur changement mot de passe admin:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du mot de passe.' },
      { status: 500 }
    );
  }
}
