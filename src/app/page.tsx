import { prisma } from '@/lib/prisma';
import ShopClient from '@/components/ShopClient';
import { Product, Category } from '@/types';

export const dynamic = 'force-dynamic';

async function getShopData() {
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        include: {
          category: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.category.findMany({
        orderBy: {
          name: 'asc',
        },
      }),
    ]);

    return { products, categories };
  } catch (error) {
    console.error('Erreur lecture données boutique :', error);
    return { products: [], categories: [] };
  }
}

export default async function HomePage() {
  const { products, categories } = await getShopData();

  return (
    <ShopClient
      initialProducts={products as unknown as Product[]}
      categories={categories as unknown as Category[]}
    />
  );
}
