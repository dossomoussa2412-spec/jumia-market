'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Plus,
  Minus,
  Check,
  ArrowLeft,
  Truck,
  ShieldCheck,
  Clock,
  PhoneCall,
  Share2,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { Product } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

export default function ProductDetailClient({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const maxAvailable = product.stock;

  const handleIncrement = () => {
    if (quantity < maxAvailable) setQuantity((q) => q + 1);
  };

  const handleDecrement = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity);
    router.push('/panier');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const discountPercentage =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Navigation retour & Fil d'ariane */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à la boutique
          </Link>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-brand-400 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {copiedLink ? 'Lien copié !' : 'Partager'}
          </button>
        </div>

        {/* Contenu principal */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Image Produit */}
            <div className="relative aspect-square w-full rounded-2xl bg-zinc-950 overflow-hidden border border-zinc-800 flex items-center justify-center">
              {product.imageUrl ? (
                <Image
                  src={product.imageUrl}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="text-zinc-600 text-sm">Image non disponible</div>
              )}

              {discountPercentage && (
                <span className="absolute top-4 left-4 bg-brand-500 text-zinc-950 font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-xl shadow-lg">
                  -{discountPercentage}% DE RÉDUCTION
                </span>
              )}
            </div>

            {/* Fiche Technique & Achat */}
            <div className="flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                {/* Catégorie & Stock */}
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  {product.category && (
                    <span className="text-xs font-bold uppercase tracking-wider text-brand-400 bg-brand-500/10 px-3 py-1 rounded-lg border border-brand-500/20">
                      {product.category.name}
                    </span>
                  )}
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-2 ${
                      isOutOfStock
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isOutOfStock ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                    />
                    {isOutOfStock ? 'Rupture de stock' : `En stock (${product.stock} exemplaires disponibles)`}
                  </span>
                </div>

                {/* Titre */}
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                  {product.title}
                </h1>

                {/* Prix FCFA */}
                <div className="flex items-baseline gap-4 pt-2">
                  <span className="text-3xl sm:text-4xl font-black text-white">
                    {formatFCFA(product.price)}
                  </span>
                  {product.oldPrice && product.oldPrice > product.price && (
                    <span className="text-lg text-zinc-500 line-through">
                      {formatFCFA(product.oldPrice)}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div className="pt-4 border-t border-zinc-800">
                  <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-2">
                    Description du produit
                  </h3>
                  <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                    {product.description || 'Aucune description détaillée n\'est fournie pour cet article.'}
                  </p>
                </div>

                {/* Avantages rassurants */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-zinc-800 text-xs text-zinc-300">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                    <Truck className="w-5 h-5 text-brand-400 flex-shrink-0" />
                    <div>
                      <strong className="block text-white">Livraison 24h</strong>
                      <span>Abidjan et partout en Côte d'Ivoire</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
                    <ShieldCheck className="w-5 h-5 text-brand-400 flex-shrink-0" />
                    <div>
                      <strong className="block text-white">Paiement à la réception</strong>
                      <span>Espèces ou Mobile Money sécurisé</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions d'achat */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                {!isOutOfStock && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-zinc-300">Quantité désirée :</span>
                    <div className="flex items-center gap-3 bg-zinc-800 rounded-xl p-1.5 border border-zinc-700">
                      <button
                        onClick={handleDecrement}
                        disabled={quantity <= 1}
                        className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 text-center text-base font-black text-white">
                        {quantity}
                      </span>
                      <button
                        onClick={handleIncrement}
                        disabled={quantity >= maxAvailable}
                        className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                    className={`py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                      isOutOfStock
                        ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                        : justAdded
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                    }`}
                  >
                    {justAdded ? (
                      <>
                        <Check className="w-5 h-5" />
                        Ajouté au panier !
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" />
                        {isOutOfStock ? 'Article Épuisé' : 'Ajouter au panier'}
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                    className="py-3.5 px-6 rounded-2xl font-black text-sm bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-zinc-950 flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-500/20 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Commander immédiatement
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
