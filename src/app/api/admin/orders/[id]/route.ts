import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';
import { OrderStatus } from '@/types';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!verifyAdminSession()) {
      return NextResponse.json(
        { error: 'Non autorisé. Veuillez vous connecter à l\'espace admin.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { status } = body;

    const allowedStatuses: OrderStatus[] = [
      'PENDING',
      'CONFIRMED',
      'SHIPPING',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Statut de commande invalide.' },
        { status: 400 }
      );
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Statut mis à jour avec succès.',
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('Erreur mise à jour commande :', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour.' },
      { status: 500 }
    );
  }
}
