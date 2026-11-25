import { NextRequest, NextResponse } from "next/server";
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

export async function DELETE(_req: NextRequest, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const { id } = await context.params;
    const prismaMod = await import("@/lib/prisma").catch(() => null);
    const prisma = prismaMod?.prisma || prismaMod?.default;
    if (prisma?.product) {
      await prisma.product.delete({ where: { id } });
    }
    return Response.json({ ok: true, id });
  } catch (err) {
    return Response.json({ error: err?.message || "Erreur suppression" }, { status: 500 });
  }
}
