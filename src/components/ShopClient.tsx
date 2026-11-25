'use client';

import React, { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar';
import Banner from '@/components/Banner';
import ProductCard from '@/components/ProductCard';
import ProductModal from '@/components/ProductModal';
import { Product, Category } from '@/types';
import { Filter, Layers, Sparkles, SearchX } from 'lucide-react';

interface ShopClientProps {
  initialProducts: Product[];
  categories: Category[];
}

export default function ShopClient({ initialProducts, categories }: ShopClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

  // Filtrage combiné : Catégorie + Recherche
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      // Filtrer par statut actif
      if (!product.isActive) return false;

      // Filtrer par catégorie
      const matchesCategory =
        selectedCategory === 'all' || product.categoryId === selectedCategory;

      // Filtrer par recherche (titre ou description)
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        product.title.toLowerCase().includes(q) ||
        (product.description && product.description.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [initialProducts, selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Navbar avec barre de recherche connectée */}
      <Navbar
        initialSearchQuery={searchQuery}
        onSearchChange={(q) => setSearchQuery(q)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Bannière Promotionnelle */}
        <Banner />

        {/* Categories Bar & Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-400" />
              Rayons & Catégories
            </h2>
            <span className="text-xs text-zinc-400">
              {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''} trouvé{filteredProducts.length > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                selectedCategory === 'all'
                  ? 'bg-brand-500 text-zinc-950 shadow-md shadow-brand-500/20'
                  : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              Toutes les catégories
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-brand-500 text-zinc-950 shadow-md shadow-brand-500/20'
                    : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800 border border-zinc-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback if search active */}
        {searchQuery.trim() !== '' && (
          <div className="mb-6 flex items-center justify-between bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl text-sm">
            <span className="text-zinc-300">
              Résultats pour : <strong className="text-brand-400 font-bold">"{searchQuery}"</strong>
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs text-zinc-400 hover:text-white underline"
            >
              Effacer la recherche
            </button>
          </div>
        )}

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenQuickView={(p) => setSelectedProductForModal(p)}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center bg-zinc-900/50 rounded-3xl border border-zinc-800 p-8">
            <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
              <SearchX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white">Aucun produit ne correspond</h3>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-sm mx-auto">
              Essayez de modifier votre mot-clé ou de sélectionner une autre catégorie de produits.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-5 px-5 py-2.5 bg-brand-500 text-zinc-950 font-bold text-xs rounded-xl shadow-md hover:bg-brand-400 transition-colors"
            >
              Réinitialiser tous les filtres
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 bg-zinc-900 border-t border-zinc-800 py-8 px-4 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} JUMIA EXPRESS CI - Tous droits réservés. Vente en ligne & Livraison Express.</p>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>Paiements acceptés : Espèces, Wave, Orange Money, MTN Moov</span>
          </div>
        </div>
      </footer>

      {/* Quick View Modal */}
      <ProductModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
      />
    </div>
  );
}
