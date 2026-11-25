'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Eye, Check, AlertCircle } from 'lucide-react';
import { Product } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
  onOpenQuickView?: (product: Product) => void;
}

export default function ProductCard({ product, onOpenQuickView }: ProductCardProps) {
  const { addToCart, items } = useCart();
  const [justAdded, setJustAdded] = React.useState(false);

  const cartItem = items.find((i) => i.product.id === product.id);
  const isInCart = Boolean(cartItem);
  const isOutOfStock = product.stock <= 0;

  const discountPercentage =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;

    addToCart(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  return (
    <div className="group flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/5 transition-all duration-300">
      {/* Image Container */}
      <div className="relative aspect-square w-full bg-zinc-950 overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-zinc-600 bg-zinc-800 text-xs">
            Image non disponible
          </div>
        )}

        {/* Badges Overlay */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {discountPercentage && (
            <span className="bg-brand-500 text-zinc-950 font-black text-xs px-2.5 py-1 rounded-lg shadow-md">
              -{discountPercentage}%
            </span>
          )}
          {product.category && (
            <span className="bg-zinc-900/80 backdrop-blur-sm text-zinc-300 text-[10px] font-medium px-2 py-0.5 rounded-md border border-zinc-700/60">
              {product.category.name}
            </span>
          )}
        </div>

        {/* Quick View Button overlay */}
        {onOpenQuickView && (
          <button
            onClick={() => onOpenQuickView(product)}
            className="absolute top-2.5 right-2.5 p-2 bg-zinc-900/80 hover:bg-brand-500 hover:text-zinc-950 text-zinc-300 rounded-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md"
            title="Aperçu rapide"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-zinc-950/75 backdrop-blur-[2px] flex items-center justify-center">
            <span className="bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-xs px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              Rupture de stock
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Stock Indicator */}
          <div className="flex items-center gap-1.5 mb-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isOutOfStock ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
            />
            <span
              className={`text-[11px] font-medium ${
                isOutOfStock ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {isOutOfStock ? 'Rupture' : `En stock (${product.stock} dispo)`}
            </span>
          </div>

          {/* Title */}
          <Link
            href={`/produit/${product.id}`}
            className="font-semibold text-sm text-white line-clamp-2 hover:text-brand-400 transition-colors leading-snug"
            title={product.title}
          >
            {product.title}
          </Link>
        </div>

        {/* Pricing and Cart Action */}
        <div className="pt-2 border-t border-zinc-800/80">
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-black text-white">
              {formatFCFA(product.price)}
            </span>
            {product.oldPrice && product.oldPrice > product.price && (
              <span className="text-xs text-zinc-500 line-through">
                {formatFCFA(product.oldPrice)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm ${
                isOutOfStock
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
                  : justAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-500 hover:bg-brand-400 text-zinc-950 shadow-brand-500/10'
              }`}
            >
              {justAdded ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Ajouté !
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {isOutOfStock ? 'Épuisé' : 'Ajouter au panier'}
                </>
              )}
            </button>

            <Link
              href={`/produit/${product.id}`}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700/60"
              title="Voir la fiche détaillée"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
