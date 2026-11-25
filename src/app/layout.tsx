import type { Metadata } from 'next';
import './globals.css';
import { CartProvider } from '@/context/CartContext';

export const metadata: Metadata = {
  title: 'JUMIA EXPRESS CI | Boutique en Ligne Côte d\'Ivoire',
  description:
    'Achetez en ligne au meilleur prix en Franc CFA (FCFA) : smartphones, électronique, mode, électroménager. Commande sans compte, paiement à la livraison et suivi en temps réel.',
  keywords: 'e-commerce, côte d\'ivoire, abidjan, jumia, vente en ligne, fcfa, livraison rapide',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-brand-500 selection:text-zinc-950">
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
