import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query || query.trim() === '') {
      return NextResponse.json(
        { error: 'Veuillez saisir un code de suivi (ex: CMD-482910) ou un numéro de téléphone.' },
        { status: 400 }
      );
    }

    const cleanQuery = query.trim();

    // Recherche par code de suivi exact ou par numéro de téléphone
    const orders = await prisma.order.findMany({
      where: {
        OR: [
          {
            trackingCode: {
              equals: cleanQuery.toUpperCase(),
              mode: 'insensitive',
            },
          },
          {
            customerPhone: {
              contains: cleanQuery,
              mode: 'insensitive',
            },
          },
        ],
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (orders.length === 0) {
      return NextResponse.json(
        {
          orders: [],
          message: `Aucune commande trouvée correspondant à "${cleanQuery}". Vérifiez le code ou le numéro de téléphone.`,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        orders,
        count: orders.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Erreur suivi commande :', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la recherche de votre commande. Veuillez réessayer.',
      },
      { status: 500 }
    );
  }
}
