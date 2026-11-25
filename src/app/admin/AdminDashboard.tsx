'use client';

import AdminPasswordForm from '@/components/AdminPasswordForm';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  ShoppingBag,
  LogOut,
  RefreshCw,
  Phone,
  MapPin,
  Clock,
  Plus,
  Check,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Order, Product, Category, OrderStatus } from '@/types';
import {
  formatFCFA,
  ORDER_STATUS_DETAILS,
  getPaymentMethodLabel,
  formatDateFR,
} from '@/lib/utils';

interface AdminDashboardProps {
  initialOrders: Order[];
  initialProducts: Product[];
  categories: Category[];
}

export default function AdminDashboard({
  initialOrders,
  initialProducts,
  categories,
}: AdminDashboardProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders');

  // Commandes State
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Produits State
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    title: '',
    categoryId: categories[0]?.id || '',
    price: '',
    oldPrice: '',
    stock: '10',
    imageUrl: '',
    description: '',
  });
  const [productMessage, setProductMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);

  // Déconnexion
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  // Mise à jour du statut d'une commande
  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Mettre à jour la liste locale
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error: any) {
      alert(`Erreur de mise à jour : ${error.message}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Création d'un nouveau produit
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductMessage(null);

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProductForm),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProducts((prev) => [data.product, ...prev]);
      setProductMessage({ type: 'success', text: 'Produit ajouté avec succès !' });
      setIsAddingProduct(false);
      setNewProductForm({
        title: '',
        categoryId: categories[0]?.id || '',
        price: '',
        oldPrice: '',
        stock: '10',
        imageUrl: '',
        description: '',
      });
      setTimeout(() => setProductMessage(null), 3000);
    } catch (error: any) {
      setProductMessage({ type: 'error', text: error.message });
    }
  };

  // Modification rapide d'un produit (stock, prix, statut actif)
  const handleUpdateProduct = async (
    productId: string,
    updates: { price?: number; stock?: number; isActive?: boolean }
  ) => {
    setSavingProductId(productId);
    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? data.product : p))
      );
    } catch (error: any) {
      alert(`Erreur modification produit : ${error.message}`);
    } finally {
      setSavingProductId(null);
    }
  };

  // Filtrage des commandes
  const filteredOrders = orders.filter((o) => {
    if (statusFilter === 'ALL') return true;
    return o.status === statusFilter;
  });

  
  const [openEditId, setOpenEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ id: string; name: string; price: string; stock: string }>({
    id: "",
    name: "",
    price: "",
    stock: "",
  });
  const [savingEditId, setSavingEditId] = useState<string | null>(null);

  const toggleEditProduct = (item: any) => {
    if (openEditId === item.id) {
      setOpenEditId(null);
      return;
    }
    setOpenEditId(item.id);
    setEditForm({
      id: item.id,
      name: item.name ?? "",
      price: String(item.price ?? ""),
      stock: String(item.stock ?? ""),
    });
  };

  const submitEditProduct = async (itemId: string) => {
    setSavingEditId(itemId);
    try {
      const res = await fetch(`/api/admin/products/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editForm.name,
          price: Number(editForm.price),
          stock: Number(editForm.stock),
        }),
      });
      if (res.ok && typeof window !== "undefined") {
        window.location.reload();
      } else if (typeof window !== "undefined") {
        const err = await res.json().catch(() => ({}));
        window.alert(err.error || "Erreur lors de la modification");
      }
    } finally {
      setSavingEditId(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    if (res.ok && typeof window !== "undefined") {
        window.location.reload();
      } else if (typeof window !== "undefined") {
        const errData = await res.json().catch(() => ({}));
        window.alert(errData.error || "Impossible de modifier le produit.");
      }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col text-zinc-100">
      {/* Top Navbar Admin */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-4 sm:px-8 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 group text-white font-black text-lg"
          >
            <div className="w-8 h-8 rounded-lg bg-brand-500 text-zinc-950 flex items-center justify-center font-black">
              J
            </div>
            <span>Jumia Admin</span>
          </Link>
          <span className="text-zinc-500 text-sm">| Espace Gestion</span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            target="_blank"
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Voir la boutique
          </Link>
          <button
            onClick={handleLogout}
            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            Déconnexion
          </button>
        </div>
      </header>

      {/* Navigation Onglets */}
      <div className="border-b border-zinc-800 bg-zinc-900/60 backdrop-blur-sm sticky top-[65px] z-20 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            Gestion des Commandes ({orders.length})
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`py-3.5 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'products'
                ? 'border-brand-500 text-brand-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            Gestion des Produits ({products.length})
          </button>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        {/* ===================== ONGLET 1 : COMMANDES ===================== */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Filtre par statut */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-400">Filtrer par statut :</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-brand-500"
                >
                  <option value="ALL">Tous les statuts ({orders.length})</option>
                  <option value="PENDING">PENDING (En attente)</option>
                  <option value="CONFIRMED">CONFIRMED (Confirmée)</option>
                  <option value="SHIPPING">SHIPPING (En livraison)</option>
                  <option value="DELIVERED">DELIVERED (Livrée)</option>
                  <option value="CANCELLED">CANCELLED (Annulée)</option>
                </select>
              </div>

              <div className="text-xs text-zinc-400">
                Affichage de <strong className="text-white">{filteredOrders.length}</strong> commande(s)
              </div>
            </div>

            {/* Liste des commandes */}
            {filteredOrders.length === 0 ? (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-400">
                Aucune commande ne correspond à ce filtre.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => {
                  const statusInfo = ORDER_STATUS_DETAILS[order.status];
                  const isUpdating = updatingOrderId === order.id;

                  return (
                    <div
                      key={order.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-md hover:border-zinc-700 transition-colors space-y-4"
                    >
                      {/* Top Header Commande */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-lg font-black text-brand-400">
                            {order.trackingCode}
                          </span>
                          <span className="text-xs text-zinc-400">
                            {formatDateFR(order.createdAt)}
                          </span>
                        </div>

                        {/* Sélecteur de statut rapide */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400">Statut :</span>
                          <select
                            value={order.status}
                            disabled={isUpdating}
                            onChange={(e) =>
                              handleStatusChange(order.id, e.target.value as OrderStatus)
                            }
                            className={`rounded-xl px-3 py-1.5 text-xs font-bold border focus:outline-none transition-colors ${
                              statusInfo?.badgeClass || 'bg-zinc-800 text-white'
                            }`}
                          >
                            <option value="PENDING">PENDING — Reçue</option>
                            <option value="CONFIRMED">CONFIRMED — Confirmée</option>
                            <option value="SHIPPING">SHIPPING — En livraison</option>
                            <option value="DELIVERED">DELIVERED — Livrée</option>
                            <option value="CANCELLED">CANCELLED — Annulée</option>
                          </select>
                          {isUpdating && (
                            <div className="w-3.5 h-3.5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                          )}
                        </div>
                      </div>

                      {/* Infos Client & Détails */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1.5 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
                          <div>
                            <strong className="text-zinc-400">Client :</strong>{' '}
                            <span className="text-white font-bold">{order.customerName}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <strong className="text-zinc-400">Téléphone :</strong>{' '}
                            <a
                              href={`tel:${order.customerPhone}`}
                              className="text-brand-400 hover:underline font-bold flex items-center gap-1"
                            >
                              <Phone className="w-3 h-3" />
                              {order.customerPhone}
                            </a>
                          </div>
                          <div>
                            <strong className="text-zinc-400">Zone :</strong>{' '}
                            <span className="text-white">{order.deliveryZone}</span>
                          </div>
                          {order.addressDetail && (
                            <div>
                              <strong className="text-zinc-400">Repère adresse :</strong>{' '}
                              <span className="text-zinc-300">{order.addressDetail}</span>
                            </div>
                          )}
                        </div>

                        <div className="space-y-1.5 bg-zinc-950/60 p-3 rounded-xl border border-zinc-800/80">
                          <div>
                            <strong className="text-zinc-400">Paiement :</strong>{' '}
                            <span className="text-brand-400 font-bold">
                              {getPaymentMethodLabel(order.paymentMethod)}
                            </span>
                          </div>
                          <div>
                            <strong className="text-zinc-400">Frais de livraison :</strong>{' '}
                            <span className="text-zinc-200">{formatFCFA(order.deliveryFee)}</span>
                          </div>
                          <div>
                            <strong className="text-zinc-400">Montant Total :</strong>{' '}
                            <span className="text-white font-black text-sm">
                              {formatFCFA(order.totalAmount)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Liste des articles */}
                      <div className="border-t border-zinc-800 pt-3">
                        <span className="text-[11px] font-bold uppercase text-zinc-400 tracking-wider block mb-2">
                          Articles commandés :
                        </span>
                        <div className="divide-y divide-zinc-800/60 bg-zinc-950/40 rounded-xl overflow-hidden border border-zinc-800/60 text-xs">
                          {order.items?.map((item) => (
                            <div
                              key={item.id}
                              className="p-2.5 flex items-center justify-between"
                            >
                              <span className="text-zinc-200">
                                {item.product?.title || 'Produit'} (Qté :{' '}
                                <strong className="text-white">{item.quantity}</strong>)
                              </span>
                              <span className="font-bold text-white">
                                {formatFCFA(item.unitPrice * item.quantity)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===================== ONGLET 2 : PRODUITS ===================== */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Top Bar Produits */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
              <div>
                <h2 className="text-base font-bold text-white">Catalogue des Produits</h2>
                <p className="text-xs text-zinc-400">
                  Gérez vos stocks, prix FCFA et ajoutez de nouveaux articles
                </p>
              </div>

              <button
                onClick={() => setIsAddingProduct(!isAddingProduct)}
                className="px-4 py-2 bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 self-start sm:self-auto transition-colors"
              >
                <Plus className="w-4 h-4" />
                {isAddingProduct ? 'Fermer le formulaire' : 'Ajouter un produit'}
              </button>
            </div>

            {/* Notification message */}
            {productMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2 ${
                  productMessage.type === 'success'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}
              >
                {productMessage.type === 'success' ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span>{productMessage.text}</span>
              </div>
            )}

            {/* Formulaire d'ajout de produit */}
            {isAddingProduct && (
              <div className="bg-zinc-900 border border-brand-500/40 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  Nouveau Produit
                </h3>

                <form onSubmit={handleCreateProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">
                        Titre du produit <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ex: Smartphone Tecno Camon 30 (256 Go)"
                        value={newProductForm.title}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, title: e.target.value })
                        }
                        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">
                        Catégorie
                      </label>
                      <select
                        value={newProductForm.categoryId}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, categoryId: e.target.value })
                        }
                        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">
                        Prix de vente en FCFA (Entier) <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        placeholder="Ex: 85000"
                        value={newProductForm.price}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, price: e.target.value })
                        }
                        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">
                        Ancien prix barré en FCFA (Optionnel)
                      </label>
                      <input
                        type="number"
                        placeholder="Ex: 99000"
                        value={newProductForm.oldPrice}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, oldPrice: e.target.value })
                        }
                        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">
                        Stock initial <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="Ex: 15"
                        value={newProductForm.stock}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, stock: e.target.value })
                        }
                        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-zinc-300 mb-1">
                        URL de l'image (Unsplash ou direct)
                      </label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={newProductForm.imageUrl}
                        onChange={(e) =>
                          setNewProductForm({ ...newProductForm, imageUrl: e.target.value })
                        }
                        className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Description du produit
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Détails, caractéristiques techniques, avantages..."
                      value={newProductForm.description}
                      onChange={(e) =>
                        setNewProductForm({ ...newProductForm, description: e.target.value })
                      }
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingProduct(false)}
                      className="px-4 py-2 bg-zinc-800 text-zinc-300 rounded-xl text-xs hover:bg-zinc-700"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-xs rounded-xl shadow-md"
                    >
                      Enregistrer le produit
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Tableau des produits avec édition rapide */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-800/80 text-zinc-400 border-b border-zinc-800 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Produit</th>
                      <th className="py-3 px-4">Catégorie</th>
                      <th className="py-3 px-4">Prix FCFA</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4">Statut</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {products.map((product) => {
                      const isSaving = savingProductId === product.id;

                      return (
                        <tr key={product.id} className="hover:bg-zinc-800/40">
                          {/* Image & Titre */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              {product.imageUrl && (
                                <div className="relative w-10 h-10 rounded-lg bg-zinc-950 overflow-hidden flex-shrink-0 border border-zinc-800">
                                  <Image
                                    src={product.imageUrl}
                                    alt={product.title}
                                    fill
                                    sizes="40px"
                                    className="object-cover"
                                  />
                                </div>
                              )}
                              <span className="font-bold text-white max-w-xs truncate block">
                                {product.title}
                              </span>
                            </div>
                          </td>

                          {/* Catégorie */}
                          <td className="py-3 px-4 text-zinc-400">
                            {product.category?.name || '-'}
                          </td>

                          {/* Prix FCFA (Modifiable) */}
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              defaultValue={product.price}
                              onBlur={(e) => {
                                const newP = parseInt(e.target.value, 10);
                                if (!isNaN(newP) && newP !== product.price) {
                                  handleUpdateProduct(product.id, { price: newP });
                                }
                              }}
                              className="w-24 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs text-white font-bold"
                            />
                          </td>

                          {/* Stock (Modifiable) */}
                          <td className="py-3 px-4">
                            <input
                              type="number"
                              min="0"
                              defaultValue={product.stock}
                              onBlur={(e) => {
                                const newS = parseInt(e.target.value, 10);
                                if (!isNaN(newS) && newS !== product.stock) {
                                  handleUpdateProduct(product.id, { stock: newS });
                                }
                              }}
                              className={`w-16 bg-zinc-800 border rounded-lg px-2 py-1 text-xs font-bold ${
                                product.stock === 0
                                  ? 'border-rose-500 text-rose-400'
                                  : 'border-zinc-700 text-white'
                              }`}
                            />
                          </td>

                          {/* Statut En vente / Désactivé */}
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                product.isActive
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                              }`}
                            >
                              {product.isActive ? 'En vente' : 'Désactivé'}
                            </span>
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() =>
                                handleUpdateProduct(product.id, {
                                  isActive: !product.isActive,
                                })
                              }
                              disabled={isSaving}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                                product.isActive
                                  ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20'
                                  : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                              }`}
                            >
                              {product.isActive ? 'Désactiver' : 'Activer'}
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleEditProduct(product)}
                              className="ml-2 px-3 py-1.5 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
                            >
                              Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(product.id)}
                              className="ml-2 px-3 py-1.5 rounded bg-red-600 text-white text-xs font-medium hover:bg-red-700"
                            >
                              Supprimer
                            </button>
                          </td>
                        </tr>
                        {openEditId === product.id && (
                          <tr className="bg-zinc-900 border-b border-zinc-800">
                            <td colSpan={6} className="px-4 py-3">
                              <div className="flex flex-wrap items-end gap-3">
                                <div className="flex-1 min-w-[200px]">
                                  <label className="block text-xs text-zinc-400 mb-1">Produit</label>
                                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3 py-1.5 rounded bg-zinc-950 border border-zinc-700 text-white text-sm" />
                                </div>
                                <div className="w-36">
                                  <label className="block text-xs text-zinc-400 mb-1">Prix (FCFA)</label>
                                  <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="w-full px-3 py-1.5 rounded bg-zinc-950 border border-zinc-700 text-white text-sm" />
                                </div>
                                <div className="w-28">
                                  <label className="block text-xs text-zinc-400 mb-1">Stock</label>
                                  <input type="number" value={editStock} onChange={(e) => setEditStock(e.target.value)} className="w-full px-3 py-1.5 rounded bg-zinc-950 border border-zinc-700 text-white text-sm" />
                                </div>
                                <div className="flex items-center gap-2">
                                  <button type="button" disabled={savingEdit} onClick={() => submitEditProduct(product.id)} className="px-3 py-1.5 rounded bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 disabled:opacity-50">{savingEdit ? "Enregistrement..." : "Enregistrer"}</button>
                                  <button type="button" onClick={() => setOpenEditId(null)} className="px-3 py-1.5 rounded bg-zinc-700 text-white text-xs font-medium hover:bg-zinc-600">Annuler</button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        <section className="mt-8 pt-6 border-t border-zinc-800">
          <AdminPasswordForm />
        </section>
      </main>

    </div>
  );
}


