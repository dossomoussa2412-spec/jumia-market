export const dynamic = "force-dynamic";
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!verifyAdminSession()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { price, oldPrice, stock, isActive } = body;

    const dataToUpdate: any = {};

    if (price !== undefined) {
      const p = parseInt(String(price), 10);
      if (!isNaN(p)) dataToUpdate.price = p;
    }

    if (oldPrice !== undefined) {
      if (oldPrice === null || oldPrice === '') {
        dataToUpdate.oldPrice = null;
      } else {
        const op = parseInt(String(oldPrice), 10);
        if (!isNaN(op)) dataToUpdate.oldPrice = op;
      }
    }

    if (stock !== undefined) {
      const s = parseInt(String(stock), 10);
      if (!isNaN(s) && s >= 0) dataToUpdate.stock = s;
    }

    if (isActive !== undefined) {
      dataToUpdate.isActive = Boolean(isActive);
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: dataToUpdate,
      include: { category: true },
    });

    return NextResponse.json({
      success: true,
      message: 'Produit mis à jour avec succès.',
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error('Erreur mise à jour produit :', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour du produit.' },
      { status: 500 }
    );
  }
}
