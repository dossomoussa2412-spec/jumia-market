'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Search,
  Truck,
  Package,
  Calendar,
  Phone,
  MapPin,
  CreditCard,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import OrderStepper from '@/components/OrderStepper';
import { Order } from '@/types';
import {
  formatFCFA,
  ORDER_STATUS_DETAILS,
  getPaymentMethodLabel,
  formatDateFR,
} from '@/lib/utils';

function SuiviContent() {
  const searchParams = useSearchParams();
  const codeParam = searchParams.get('code');

  const [query, setQuery] = useState(codeParam || '');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchOrders = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/orders/track?query=${encodeURIComponent(searchTerm.trim())}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la recherche.');
      }

      setOrders(data.orders || []);
      if (!data.orders || data.orders.length === 0) {
        setErrorMsg(data.message || 'Aucune commande trouvée.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Impossible de joindre le serveur.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (codeParam) {
      setQuery(codeParam);
      fetchOrders(codeParam);
    }
  }, [codeParam]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrders(query);
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto space-y-3 mb-8">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-md">
          <Truck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Suivi de Commande en Temps Réel
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400">
          Entrez votre code de suivi unique (ex: <code className="text-brand-400 font-mono">CMD-482910</code>) ou le numéro de téléphone utilisé lors de votre commande.
        </p>
      </div>

      {/* Formulaire de recherche */}
      <form
        onSubmit={handleSearchSubmit}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-3 sm:p-4 shadow-xl flex flex-col sm:flex-row gap-3 mb-10 max-w-2xl mx-auto"
      >
        <div className="relative flex-1">
          <input
            type="text"
            required
            placeholder="Code de suivi (CMD-XXXXXX) ou Numéro de téléphone"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-brand-500"
          />
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 bg-brand-500 hover:bg-brand-400 text-zinc-950 font-black text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 flex-shrink-0 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              Recherche...
            </>
          ) : (
            'Rechercher'
          )}
        </button>
      </form>

      {/* Erreur ou aucun résultat */}
      {errorMsg && (
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-2xl text-center space-y-2 mb-8 max-w-md mx-auto">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <p className="text-sm text-zinc-300 font-medium">{errorMsg}</p>
          <p className="text-xs text-zinc-500">
            Assurez-vous d'avoir bien orthographié votre code au format CMD-XXXXXX ou d'entrer le numéro exact sans espaces parasites.
          </p>
        </div>
      )}

      {/* Liste des commandes trouvées */}
      {orders.length > 0 && (
        <div className="space-y-8">
          <div className="text-xs text-zinc-400 font-medium flex items-center justify-between">
            <span>
              {orders.length} commande{orders.length > 1 ? 's' : ''} trouvée{orders.length > 1 ? 's' : ''}
            </span>
            <button
              onClick={() => fetchOrders(query)}
              className="flex items-center gap-1 text-brand-400 hover:text-brand-300"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Actualiser le statut
            </button>
          </div>

          {orders.map((order) => {
            const statusDetail = ORDER_STATUS_DETAILS[order.status];

            return (
              <div
                key={order.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
              >
                {/* Entête de la commande */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xl sm:text-2xl font-black text-brand-400">
                        {order.trackingCode}
                      </span>
                      <button
                        onClick={() => copyCode(order.trackingCode)}
                        className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors"
                        title="Copier le code"
                      >
                        {copiedCode === order.trackingCode ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Passée le {formatDateFR(order.createdAt)}</span>
                    </div>
                  </div>

                  {/* Badge de statut */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold ${
                        statusDetail ? statusDetail.badgeClass : 'bg-zinc-800 text-zinc-300'
                      }`}
                    >
                      {statusDetail?.label || order.status}
                    </span>
                  </div>
                </div>

                {/* STEPPER PROGRESS BAR */}
                <div>
                  <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-3">
                    Progression de la livraison
                  </h3>
                  <OrderStepper status={order.status} />
                </div>

                {/* Informations de livraison & client */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-950/60 p-4 rounded-2xl border border-zinc-800/80 text-xs">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <MapPin className="w-4 h-4 text-brand-400" />
                      <strong className="text-white">Zone de livraison :</strong>
                      <span>{order.deliveryZone}</span>
                    </div>
                    {order.addressDetail && (
                      <div className="text-zinc-400 pl-6">
                        <span>Repère : {order.addressDetail}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Phone className="w-4 h-4 text-brand-400" />
                      <strong className="text-white">Destinataire :</strong>
                      <span>{order.customerName} ({order.customerPhone})</span>
                    </div>
                    <div className="flex items-center gap-2 text-zinc-400">
                      <CreditCard className="w-4 h-4 text-brand-400" />
                      <strong className="text-white">Paiement :</strong>
                      <span className="text-brand-300">
                        {getPaymentMethodLabel(order.paymentMethod)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Détail des articles commandés */}
                <div>
                  <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-wider mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-brand-400" />
                    Articles commandés ({order.items?.length || 0})
                  </h3>
                  <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-2xl overflow-hidden bg-zinc-950/40">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="p-3.5 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          {item.product?.imageUrl && (
                            <div className="relative w-12 h-12 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0 border border-zinc-800">
                              <Image
                                src={item.product.imageUrl}
                                alt={item.product.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            </div>
                          )}
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-white block">
                              {item.product?.title || 'Produit'}
                            </span>
                            <span className="text-xs text-zinc-400">
                              Quantité : <strong className="text-zinc-200">{item.quantity}</strong> × {formatFCFA(item.unitPrice)}
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-black text-xs sm:text-sm text-white">
                          {formatFCFA(item.unitPrice * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Récapitulatif financier */}
                <div className="pt-3 border-t border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="text-zinc-400">
                    Frais de livraison inclus :{' '}
                    <strong className="text-zinc-200">{formatFCFA(order.deliveryFee)}</strong>
                  </div>
                  <div className="text-sm font-black text-white flex items-center gap-2">
                    <span>Montant total :</span>
                    <span className="text-lg text-brand-400">{formatFCFA(order.totalAmount)}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function SuiviPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        <SuiviContent />
      </Suspense>
    </div>
  );
}
