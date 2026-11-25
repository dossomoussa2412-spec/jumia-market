'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingCart, Plus, Minus, Check, AlertCircle, ShieldCheck, Truck } from 'lucide-react';
import { Product } from '@/types';
import { formatFCFA } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);

  if (!product) return null;

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
    setTimeout(() => {
      setJustAdded(false);
      onClose();
    }, 1200);
  };

  const discountPercentage =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-3xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors border border-zinc-700"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Section */}
        <div className="md:w-1/2 relative min-h-[300px] md:min-h-full bg-zinc-950 flex items-center justify-center p-6">
          {product.imageUrl ? (
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden">
              <Image
                src={product.imageUrl}
                alt={product.title}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="text-zinc-500 text-sm">Image non disponible</div>
          )}

          {discountPercentage && (
            <span className="absolute top-4 left-4 bg-brand-500 text-zinc-950 font-black text-xs px-3 py-1 rounded-xl shadow-lg">
              -{discountPercentage}% DE RÉDUCTION
            </span>
          )}
        </div>

        {/* Product Details Section */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Category and stock */}
            <div className="flex items-center justify-between gap-2">
              {product.category && (
                <span className="text-xs font-semibold text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-lg border border-brand-500/20">
                  {product.category.name}
                </span>
              )}
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
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
                {isOutOfStock ? 'Rupture de stock' : `En stock (${product.stock} restants)`}
              </span>
            </div>

            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {product.title}
            </h2>

            {/* Pricing */}
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {formatFCFA(product.price)}
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-base text-zinc-500 line-through">
                  {formatFCFA(product.oldPrice)}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="text-sm text-zinc-300 leading-relaxed border-t border-b border-zinc-800 py-3 max-h-36 overflow-y-auto">
              {product.description || 'Aucune description spécifique pour ce produit.'}
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 pt-1">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-brand-400" />
                <span>Livraison 24/48h</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                <span>Paiement à réception</span>
              </div>
            </div>
          </div>

          {/* Quantity Selector & Add to Cart */}
          <div className="space-y-4 pt-2">
            {!isOutOfStock && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300">Quantité :</span>
                <div className="flex items-center gap-2 bg-zinc-800/80 rounded-xl p-1 border border-zinc-700">
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1}
                    className="p-1.5 rounded-lg hover:bg-zinc-700 text-zinc-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-white">
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

            <div className="flex flex-col gap-2">
              <button
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`w-full py-3.5 px-6 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                  isOutOfStock
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                    : justAdded
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-brand-500 hover:bg-brand-400 text-zinc-950 shadow-brand-500/20 hover:scale-[1.01]'
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
                    {isOutOfStock ? 'Produit Épuisé' : `Ajouter (${formatFCFA(product.price * quantity)})`}
                  </>
                )}
              </button>

              <Link
                href={`/produit/${product.id}`}
                onClick={onClose}
                className="text-center text-xs text-zinc-400 hover:text-brand-400 py-1 transition-colors"
              >
                Voir la page complète du produit →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
