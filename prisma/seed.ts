import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Début du peuplement de la base de données (Seed) ---');

  // Nettoyage préalable pour éviter les doublons lors des re-runs
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // 1. Création des 4 catégories
  const catTelephones = await prisma.category.create({
    data: {
      name: 'Téléphones & Tablettes',
      slug: 'telephones-tablettes',
    },
  });

  const catAudio = await prisma.category.create({
    data: {
      name: 'Électronique & Audio',
      slug: 'electronique-audio',
    },
  });

  const catMode = await prisma.category.create({
    data: {
      name: 'Mode & Chaussures',
      slug: 'mode-chaussures',
    },
  });

  const catMaison = await prisma.category.create({
    data: {
      name: 'Maison & Électroménager',
      slug: 'maison-electromenager',
    },
  });

  console.log('✓ Catégories créées avec succès');

  // 2. Création des 8 produits avec prix en FCFA et images Unsplash
  const products = [
    {
      title: 'Infinix Hot 40 Pro (256 Go / 8 Go RAM) - Écran 120Hz - Noir Étoilé',
      description: 'Le smartphone parfait pour le multitâche et le gaming mobile. Écran 6.78 pouces FHD+ 120Hz, batterie ultra-durable 5000 mAh avec charge rapide 33W, appareil photo principal 108 MP haute définition.',
      price: 125000,
      oldPrice: 145000,
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      categoryId: catTelephones.id,
    },
    {
      title: 'Samsung Galaxy A15 (128 Go / 4 Go RAM) - Super AMOLED - Bleu Nuit',
      description: 'Profitez de la fluidité et des couleurs vives de son écran Super AMOLED 90Hz. Appareil photo triple capteur 50 MP, processeur octa-core performant et autonomie garantie 2 jours.',
      price: 95000,
      oldPrice: 110000,
      stock: 8,
      imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      categoryId: catTelephones.id,
    },
    {
      title: 'Écouteurs Sans Fil Bluetooth Pro TWS avec Réduction de Bruit Active',
      description: 'Immersion sonore totale avec des basses profondes et des aigus cristallins. Boîtier de charge sans fil offrant jusqu à 28h d autonomie totale. Résistance à l eau et à la sueur IPX5.',
      price: 14500,
      oldPrice: 19900,
      stock: 35,
      imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      categoryId: catAudio.id,
    },
    {
      title: 'Montre Connectée Smartwatch Ultra Pro - Écran AMOLED HD & Suivi Sport',
      description: 'Moniteur de fréquence cardiaque 24/7, oxygène sanguin SpO2, plus de 100 modes sportifs et appels Bluetooth directement au poignet. Bracelet en silicone étanche et boîtier robuste.',
      price: 24000,
      oldPrice: 32000,
      stock: 12,
      imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      categoryId: catAudio.id,
    },
    {
      title: 'Baskets Urbaines Air Streetwear Confort - Semelle Amortissante',
      description: 'Paire de sneakers tendance et ultra-confortable pour un style décontracté au quotidien. Semelle antidérapante en caoutchouc et tissu respirant adapté au climat tropical.',
      price: 18500,
      oldPrice: 25000,
      stock: 20,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      categoryId: catMode.id,
    },
    {
      title: 'Chaussures Sport Run Pro Performance - Amorti Maximum',
      description: 'Conçues pour la course à pied et le fitness intensif. Technologie d absorption des chocs révolutionnaire et maintien cheville optimal.',
      price: 22000,
      oldPrice: null,
      stock: 0, // Exemple de produit en rupture de stock
      imageUrl: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      categoryId: catMode.id,
    },
    {
      title: 'Blender Mixeur Multifonction 2-en-1 avec Moulin à Épices 1.5L - 800W',
      description: 'Préparez vos jus frais, smoothies onctueux et réduisez vos épices et condiments en poudre fine en quelques secondes. Lames en acier inoxydable 6 pièces et bol en verre gradué.',
      price: 17500,
      oldPrice: 23000,
      stock: 18,
      imageUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      categoryId: catMaison.id,
    },
    {
      title: 'Ventilateur Rechargeable Solaire 16 Pouces avec Lampe LED & Télécommande',
      description: 'Indispensable en cas de coupure de courant. Batterie intégrée offrant jusqu à 10 heures d autonomie continue, port USB pour recharger vos téléphones et veilleuse LED intégrée.',
      price: 35000,
      oldPrice: 42000,
      stock: 9,
      imageUrl: 'https://images.unsplash.com/photo-1618941716939-553df3c6c278?auto=format&fit=crop&w=800&q=80',
      isActive: true,
      categoryId: catMaison.id,
    },
  ];

  for (const productData of products) {
    await prisma.product.create({
      data: productData,
    });
  }

  console.log(`✓ ${products.length} produits créés avec succès`);

  // 3. Création d'une commande de démonstration pour tester le suivi immédiatement
  const demoProduct = await prisma.product.findFirst({
    where: { stock: { gt: 0 } },
  });

  if (demoProduct) {
    const demoOrder = await prisma.order.create({
      data: {
        trackingCode: 'CMD-482910',
        customerName: 'Kouassi Jean-Philippe',
        customerPhone: '+225 07 08 09 10 11',
        deliveryZone: 'Cocody',
        addressDetail: 'Angré 8ème tranche, Terminus 81-82, Immeuble Grace Apt 3B',
        paymentMethod: 'CASH',
        deliveryFee: 1500,
        totalAmount: demoProduct.price + 1500,
        status: 'SHIPPING',
        items: {
          create: [
            {
              productId: demoProduct.id,
              quantity: 1,
              unitPrice: demoProduct.price,
            },
          ],
        },
      },
    });
    console.log(`✓ Commande de démonstration créée : Code ${demoOrder.trackingCode}`);
  }

  console.log('--- Données initiales insérées avec succès ! ---');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
