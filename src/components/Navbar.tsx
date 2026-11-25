'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Search, Truck, ShoppingCart, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

interface NavbarProps {
  initialSearchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export default function Navbar({ initialSearchQuery = '', onSearchChange }: NavbarProps) {
  const router = useRouter();
  const { itemsCount, isLoaded } = useCart();
  const [query, setQuery] = useState(initialSearchQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(query);
    } else {
      router.push(`/?search=${encodeURIComponent(query)}`);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (onSearchChange) {
      onSearchChange(val);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-zinc-900 border-b border-zinc-800 shadow-md">
      {/* Top Banner Notice */}
      <div className="bg-brand-500 text-zinc-950 font-semibold text-xs py-1 px-4 text-center">
        ⚡ Vente Flash Abidjan & Intérieur | Paiement à la livraison (Cash) ou Mobile Money (Wave / Orange / MTN)
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-3 sm:gap-6">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-400 flex items-center justify-center text-zinc-950 font-black shadow-lg shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center">
                JUMIA<span className="text-brand-500 ml-1">EXPRESS</span>
              </span>
              <span className="text-[10px] text-zinc-400 font-medium -mt-1 tracking-wider uppercase">
                Boutique Officielle CI
              </span>
            </div>
          </Link>

          {/* Search Bar - Center */}
          <form
            onSubmit={handleSubmit}
            className="flex-1 max-w-xl hidden md:flex items-center relative"
          >
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Chercher un téléphone, écouteurs, chaussures, électroménager..."
              className="w-full bg-zinc-800/90 text-white placeholder-zinc-400 text-sm rounded-full pl-11 pr-24 py-2.5 border border-zinc-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs rounded-full transition-colors"
            >
              Rechercher
            </button>
          </form>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Suivre ma commande */}
            <Link
              href="/suivi"
              className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all font-medium text-xs sm:text-sm border border-zinc-700/60"
            >
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-brand-400" />
              <span className="hidden sm:inline">Suivre ma commande</span>
              <span className="sm:hidden">Suivi</span>
            </Link>

            {/* Panier */}
            <Link
              href="/panier"
              className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-zinc-950 font-bold text-xs sm:text-sm shadow-md shadow-brand-500/20 transition-all group"
            >
              <ShoppingCart className="w-5 h-5 text-zinc-950 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Panier</span>
              {isLoaded && itemsCount > 0 && (
                <span className="bg-zinc-950 text-brand-400 text-xs font-black px-2 py-0.5 rounded-full border border-brand-400">
                  {itemsCount}
                </span>
              )}
            </Link>

            {/* Admin shortcut */}
            <Link
              href="/admin"
              title="Espace Administrateur"
              className="p-2 rounded-xl text-zinc-400 hover:text-brand-400 hover:bg-zinc-800 transition-colors"
            >
              <ShieldCheck className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSubmit} className="flex items-center relative">
            <input
              type="text"
              value={query}
              onChange={handleInputChange}
              placeholder="Rechercher un produit..."
              className="w-full bg-zinc-800 text-white placeholder-zinc-400 text-sm rounded-full pl-10 pr-20 py-2 border border-zinc-700 focus:outline-none focus:border-brand-500"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <button
              type="submit"
              className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 bg-brand-500 text-zinc-950 font-bold text-xs rounded-full"
            >
              OK
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
