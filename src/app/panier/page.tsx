'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  CheckCircle2,
  Copy,
  Check,
  AlertCircle,
  Banknote,
  Smartphone,
  ExternalLink,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { formatFCFA, DELIVERY_ZONES, getPaymentMethodLabel } from '@/lib/utils';
import { PaymentMethod, Order } from '@/types';

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemsCount,
    subtotalAmount,
    isLoaded,
  } = useCart();

  // Formulaire de commande
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryZone, setDeliveryZone] = useState(DELIVERY_ZONES[0].zone);
  const [addressDetail, setAddressDetail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');

  // États de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [isCodeCopied, setIsCodeCopied] = useState(false);

  // Calcul des frais de livraison
  const currentZoneObj =
    DELIVERY_ZONES.find((z) => z.zone === deliveryZone) || DELIVERY_ZONES[0];
  const deliveryFee = currentZoneObj.fee;
  const grandTotal = subtotalAmount + deliveryFee;

  // Validation et soumission
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerName.trim()) {
      setErrorMessage('Veuillez renseigner votre nom complet.');
      return;
    }

    if (!customerPhone.trim()) {
      setErrorMessage('Veuillez renseigner un numéro de téléphone valide.');
      return;
    }

    if (items.length === 0) {
      setErrorMessage('Votre panier est vide.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        deliveryZone,
        addressDetail: addressDetail.trim() || null,
        paymentMethod,
        items: items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la validation de la commande.');
      }

      // Commande validée avec succès !
      setCompletedOrder(data.order);
      clearCart();
    } catch (err: any) {
      setErrorMessage(err.message || 'Une erreur inattendue est survenue.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTrackingCode = () => {
    if (completedOrder) {
      navigator.clipboard.writeText(completedOrder.trackingCode);
      setIsCodeCopied(true);
      setTimeout(() => setIsCodeCopied(false), 2000);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // ÉCRAN DE CONFIRMATION DE COMMANDE
  if (completedOrder) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col">
        <Navbar />

        <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="bg-zinc-900 border border-brand-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl text-center space-y-6">
            
            {/* Success Icon */}
            <div className="w-20 h-20 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">
                Félicitations !
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Votre commande a été enregistrée avec succès
              </h1>
              <p className="text-sm text-zinc-300 max-w-lg mx-auto">
                Notre service de livraison vous contactera au{' '}
                <strong className="text-white">{completedOrder.customerPhone}</strong>{' '}
                pour confirmer le départ de votre colis.
              </p>
            </div>

            {/* Code de Suivi Highlighted Box */}
            <div className="bg-zinc-950 border-2 border-brand-500/60 rounded-2xl p-6 max-w-md mx-auto space-y-3">
              <span className="text-xs uppercase font-semibold text-zinc-400">
                Votre Code Unique de Suivi
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl sm:text-3xl font-mono font-black text-brand-400 tracking-wider">
                  {completedOrder.trackingCode}
                </span>
                <button
                  onClick={copyTrackingCode}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                  title="Copier le code"
                >
                  {isCodeCopied ? (
                    <Check className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Copy className="w-5 h-5" />
                  )}
                </button>
              </div>
              <p className="text-[11px] text-zinc-400">
                Conservez précieusement ce code pour suivre l'acheminement de votre colis en temps réel.
              </p>
            </div>

            {/* Récapitulatif de la commande */}
            <div className="bg-zinc-800/40 border border-zinc-700/60 rounded-2xl p-5 text-left text-xs sm:text-sm space-y-3 max-w-md mx-auto">
              <div className="flex justify-between border-b border-zinc-700/60 pb-2">
                <span className="text-zinc-400">Destinataire :</span>
                <span className="font-bold text-white">{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-zinc-700/60 pb-2">
                <span className="text-zinc-400">Lieu de livraison :</span>
                <span className="font-bold text-white">{completedOrder.deliveryZone}</span>
              </div>
              {completedOrder.addressDetail && (
                <div className="flex justify-between border-b border-zinc-700/60 pb-2">
                  <span className="text-zinc-400">Repère adresse :</span>
                  <span className="text-zinc-300 text-right">{completedOrder.addressDetail}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-zinc-700/60 pb-2">
                <span className="text-zinc-400">Mode de paiement :</span>
                <span className="font-bold text-brand-400">
                  {getPaymentMethodLabel(completedOrder.paymentMethod)}
                </span>
              </div>
              <div className="flex justify-between pt-1 text-sm sm:text-base">
                <span className="font-bold text-white">Montant Total à régler :</span>
                <span className="font-black text-brand-400">
                  {formatFCFA(completedOrder.totalAmount)}
                </span>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              <Link
                href={`/suivi?code=${completedOrder.trackingCode}`}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-400 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-transform hover:scale-105"
              >
                <Truck className="w-5 h-5" />
                Suivre l'état de ma commande
              </Link>
              <Link
                href="/"
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition-colors"
              >
                Retour à l'accueil
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-6 flex items-center gap-3">
          <ShoppingBag className="w-8 h-8 text-brand-500" />
          Votre Panier & Validation de Commande
        </h1>

        {items.length === 0 ? (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-10 text-center space-y-4 max-w-xl mx-auto my-12">
            <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-white">Votre panier est vide</h2>
            <p className="text-sm text-zinc-400">
              Vous n'avez pas encore ajouté de produit à votre panier d'achat.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-400 text-zinc-950 font-bold text-sm rounded-xl transition-colors shadow-lg shadow-brand-500/20"
            >
              Découvrir nos produits en promotion
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* COLONNE GAUCHE : LISTE DES ARTICLES DU PANIER (7 col) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <span className="font-bold text-white text-sm">
                    Articles sélectionnés ({itemsCount})
                  </span>
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                  >
                    Vider le panier
                  </button>
                </div>

                <div className="divide-y divide-zinc-800">
                  {items.map((item) => (
                    <div
                      key={item.product.id}
                      className="py-4 first:pt-0 last:pb-0 flex items-center gap-4"
                    >
                      {/* Image */}
                      <div className="relative w-20 h-20 rounded-xl bg-zinc-950 overflow-hidden flex-shrink-0 border border-zinc-800">
                        {item.product.imageUrl ? (
                          <Image
                            src={item.product.imageUrl}
                            alt={item.product.title}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                            N/A
                          </div>
                        )}
                      </div>

                      {/* Info & Prix */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/produit/${item.product.id}`}
                          className="font-bold text-sm text-white hover:text-brand-400 transition-colors line-clamp-1"
                        >
                          {item.product.title}
                        </Link>
                        <div className="text-xs text-brand-400 font-extrabold mt-0.5">
                          {formatFCFA(item.product.price)}
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex items-center bg-zinc-800 rounded-lg border border-zinc-700 p-0.5">
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity - 1)
                              }
                              className="p-1 text-zinc-300 hover:text-white"
                              title="Diminuer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-7 text-center text-xs font-black text-white">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.product.id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.product.stock}
                              className="p-1 text-zinc-300 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed"
                              title="Augmenter"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-1.5 text-zinc-500 hover:text-rose-400 transition-colors"
                            title="Supprimer cet article"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Sous-total item */}
                      <div className="text-right">
                        <span className="text-sm font-black text-white">
                          {formatFCFA(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rassurance */}
              <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3 text-xs text-zinc-400">
                <ShieldCheck className="w-6 h-6 text-brand-400 flex-shrink-0" />
                <span>
                  Commande garantie sans frais cachés. Vous vérifiez le colis à la livraison avant de payer le livreur.
                </span>
              </div>
            </div>

            {/* COLONNE DROITE : FORMULAIRE DE COMMANDE DIRECTE (5 col) */}
            <div className="lg:col-span-5">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6 sticky top-28">
                <div className="border-b border-zinc-800 pb-3">
                  <h2 className="text-base font-black text-white flex items-center gap-2">
                    <Truck className="w-5 h-5 text-brand-500" />
                    Informations de Livraison
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    Pas besoin de compte. Renseignez simplement vos coordonnées.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  {/* Nom complet */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Nom complet du client <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Kouamé Jean-Marc"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  {/* Numéro de téléphone */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Numéro de téléphone (WhatsApp / Appel) <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ex: 07 08 09 10 11 ou +225 ..."
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  {/* Zone de livraison */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Commune / Zone de livraison <span className="text-rose-400">*</span>
                    </label>
                    <select
                      value={deliveryZone}
                      onChange={(e) => setDeliveryZone(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    >
                      {DELIVERY_ZONES.map((zone) => (
                        <option key={zone.zone} value={zone.zone}>
                          {zone.zone} — (+{formatFCFA(zone.fee)})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Précision d'adresse */}
                  <div>
                    <label className="block text-xs font-bold text-zinc-300 mb-1">
                      Précision de l'adresse / Repère (Optionnel)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Non loin de la pharmacie, Immeuble B..."
                      value={addressDetail}
                      onChange={(e) => setAddressDetail(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:border-brand-500"
                    />
                  </div>

                  {/* Mode de paiement */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-zinc-300 mb-2">
                      Mode de paiement à la réception <span className="text-rose-400">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {/* Espèces */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('CASH')}
                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          paymentMethod === 'CASH'
                            ? 'bg-brand-500/10 border-brand-500 text-white ring-1 ring-brand-500'
                            : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        <Banknote className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-xs block text-white">Espèces (Cash)</span>
                          <span className="text-[10px] text-zinc-400">Payer en mains propres</span>
                        </div>
                      </button>

                      {/* Mobile Money */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('MOBILE_MONEY')}
                        className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                          paymentMethod === 'MOBILE_MONEY'
                            ? 'bg-brand-500/10 border-brand-500 text-white ring-1 ring-brand-500'
                            : 'bg-zinc-800/80 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                        }`}
                      >
                        <Smartphone className="w-5 h-5 text-brand-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-xs block text-white">Mobile Money</span>
                          <span className="text-[10px] text-zinc-400">Wave / Orange / MTN</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Récapitulatif des montants */}
                  <div className="pt-4 border-t border-zinc-800 space-y-2 text-xs">
                    <div className="flex justify-between text-zinc-400">
                      <span>Sous-total articles :</span>
                      <span>{formatFCFA(subtotalAmount)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-400">
                      <span>Frais de livraison ({deliveryZone}) :</span>
                      <span>{formatFCFA(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-zinc-800 text-sm font-black">
                      <span className="text-white">Total à payer :</span>
                      <span className="text-brand-400 text-base">{formatFCFA(grandTotal)}</span>
                    </div>
                  </div>

                  {/* Bouton de confirmation */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                        Traitement de la commande...
                      </>
                    ) : (
                      <>
                        Valider ma commande ({formatFCFA(grandTotal)})
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
