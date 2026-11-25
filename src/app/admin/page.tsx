import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { verifyAdminSession } from '@/lib/auth';
import AdminDashboard from './AdminDashboard';
import { Order, Product, Category } from '@/types';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const isAuthenticated = verifyAdminSession();

  if (!isAuthenticated) {
    redirect('/admin/login');
  }

  // Récupération des commandes, produits et catégories
  const [orders, products, categories] = await Promise.all([
    prisma.order.findMany({
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
    }),
    prisma.product.findMany({
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

  return (
    <AdminDashboard
      initialOrders={orders as unknown as Order[]}
      initialProducts={products as unknown as Product[]}
      categories={categories as unknown as Category[]}
    />
  );
}
