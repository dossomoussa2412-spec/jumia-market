import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';

export async function GET() {
  try {
    if (!verifyAdminSession()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.category.findMany({
        orderBy: { name: 'asc' },
      }),
    ]);

    return NextResponse.json({ products, categories });
  } catch (error) {
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des données.' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyAdminSession()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, price, oldPrice, stock, imageUrl, categoryId } = body;

    if (!title || price === undefined || price === null) {
      return NextResponse.json(
        { error: 'Le titre et le prix en FCFA sont obligatoires.' },
        { status: 400 }
      );
    }

    const parsedPrice = parseInt(String(price), 10);
    const parsedOldPrice = oldPrice ? parseInt(String(oldPrice), 10) : null;
    const parsedStock = stock !== undefined ? parseInt(String(stock), 10) : 0;

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { error: 'Le prix doit être un entier positif.' },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        price: parsedPrice,
        oldPrice: parsedOldPrice && !isNaN(parsedOldPrice) ? parsedOldPrice : null,
        stock: isNaN(parsedStock) ? 0 : parsedStock,
        imageUrl: imageUrl ? imageUrl.trim() : null,
        categoryId: categoryId || null,
        isActive: true,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({ success: true, product: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error('Erreur ajout produit :', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du produit.' },
      { status: 500 }
    );
  }
}
