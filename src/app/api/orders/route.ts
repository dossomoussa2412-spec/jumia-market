import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateTrackingCode, DELIVERY_ZONES } from '@/lib/utils';
import { PaymentMethod } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      customerName,
      customerPhone,
      deliveryZone,
      addressDetail,
      paymentMethod = 'CASH',
      items,
    } = body;

    if (!customerName || typeof customerName !== 'string' || customerName.trim() === '') {
      return NextResponse.json(
        { error: 'Le nom complet du client est obligatoire.' },
        { status: 400 }
      );
    }

    if (!customerPhone || typeof customerPhone !== 'string' || customerPhone.trim() === '') {
      return NextResponse.json(
        { error: 'Le numéro de téléphone est obligatoire.' },
        { status: 400 }
      );
    }

    if (!deliveryZone || typeof deliveryZone !== 'string') {
      return NextResponse.json(
        { error: 'La zone de livraison est obligatoire.' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Votre panier est vide. Veuillez ajouter au moins un produit.' },
        { status: 400 }
      );
    }

    const matchedZone = DELIVERY_ZONES.find((z) => z.zone === deliveryZone);
    const deliveryFee = matchedZone ? matchedZone.fee : 1500;

    const validPaymentMethods: PaymentMethod[] = ['CASH', 'MOBILE_MONEY'];
    const chosenPaymentMethod: PaymentMethod = validPaymentMethods.includes(paymentMethod)
      ? paymentMethod
      : 'CASH';

    const productIds = Array.from(
      new Set(items.map((item) => item.productId))
    );

    const dbProducts = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map(dbProducts.map((p) => [p.id, p]));

    let subtotal = 0;
    const orderItemsToCreate: Array<{ productId: string; quantity: number; unitPrice: number }> = [];

    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!item.productId || !Number.isInteger(quantity) || quantity <= 0) {
        return NextResponse.json(
          { error: 'Quantité ou produit invalide dans le panier.' },
          { status: 400 }
        );
      }

      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Le produit demandé (ID: ${item.productId}) n'existe pas.` },
          { status: 400 }
        );
      }

      if (!product.isActive) {
        return NextResponse.json(
          { error: `Le produit "${product.title}" n'est plus disponible à la vente.` },
          { status: 400 }
        );
      }

      if (product.stock < quantity) {
        return NextResponse.json(
          {
            error: `Stock insuffisant pour "${product.title}". Stock disponible : ${product.stock}, demandé : ${quantity}.`,
          },
          { status: 400 }
        );
      }

      subtotal += product.price * quantity;
      orderItemsToCreate.push({
        productId: product.id,
        quantity,
        unitPrice: product.price,
      });
    }

    const totalAmount = subtotal + deliveryFee;

    let trackingCode = generateTrackingCode();
    let existingOrder = await prisma.order.findUnique({ where: { trackingCode } });
    let attempts = 0;
    while (existingOrder && attempts < 10) {
      trackingCode = generateTrackingCode();
      existingOrder = await prisma.order.findUnique({ where: { trackingCode } });
      attempts += 1;
    }

    const createdOrder = await prisma.$transaction(
      async (tx) => {
        for (const orderItem of orderItemsToCreate) {
          const updated = await tx.product.updateMany({
            where: {
              id: orderItem.productId,
              stock: { gte: orderItem.quantity },
            },
            data: {
              stock: { decrement: orderItem.quantity },
            },
          });

          if (updated.count === 0) {
            throw new Error(
              'Le stock d’un des articles vient d’être épuisé. Veuillez actualiser le panier.'
            );
          }
        }

        return tx.order.create({
          data: {
            trackingCode,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            deliveryZone: deliveryZone.trim(),
            addressDetail: addressDetail ? addressDetail.trim() : null,
            paymentMethod: chosenPaymentMethod,
            deliveryFee,
            totalAmount,
            status: 'PENDING',
            items: {
              create: orderItemsToCreate,
            },
          },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        });
      },
      {
        maxWait: 10000,
        timeout: 15000,
      }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Commande enregistrée avec succès !',
        order: createdOrder,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur création commande :', error);
    return NextResponse.json(
      {
        error:
          (error instanceof Error ? error.message : undefined) ||
          "Une erreur est survenue lors de l'enregistrement de votre commande.",
      },
      { status: 400 }
    );
  }
}


