import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { OrderStatus, PaymentMethod } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatage strict en Franc CFA (FCFA) avec séparateur de milliers (ex: 15 000 FCFA).
 * Les montants sont stockés en entiers (Int).
 */
export function formatFCFA(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0 FCFA';
  }
  // Utilisation d'un espace insécable ou standard pour le séparateur de milliers
  const formatted = Math.round(amount).toLocaleString('fr-FR');
  return `${formatted} FCFA`;
}

/**
 * Génération d'un code de suivi unique au format CMD-XXXXXX
 * Exemple : CMD-482910
 */
export function generateTrackingCode(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let randomPart = '';
  for (let i = 0; i < 6; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CMD-${randomPart}`;
}

/**
 * Liste des zones de livraisons configurées avec leurs frais associés
 */
export const DELIVERY_ZONES = [
  { zone: 'Cocody (Abidjan)', fee: 1500 },
  { zone: 'Plateau (Abidjan)', fee: 1500 },
  { zone: 'Marcory / Treichville / Koumassi (Abidjan)', fee: 1500 },
  { zone: 'Yopougon / Abobo (Abidjan)', fee: 2000 },
  { zone: 'Bingerville / Port-Bouët (Abidjan)', fee: 2000 },
  { zone: 'Intérieur du pays (Côte d\'Ivoire)', fee: 3500 },
];

/**
 * Informations lisibles et couleurs pour les statuts de commande
 */
export const ORDER_STATUS_DETAILS: Record<
  OrderStatus,
  { label: string; description: string; stepIndex: number; colorClass: string; badgeClass: string }
> = {
  PENDING: {
    label: 'Commande reçue',
    description: 'Votre commande a été reçue et est en attente de confirmation.',
    stepIndex: 1,
    colorClass: 'text-amber-600',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  CONFIRMED: {
    label: 'Confirmée',
    description: 'Votre commande a été validée par notre équipe et est en préparation.',
    stepIndex: 2,
    colorClass: 'text-blue-600',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
  },
  SHIPPING: {
    label: 'En cours de livraison',
    description: 'Le livreur est en route avec votre colis.',
    stepIndex: 3,
    colorClass: 'text-purple-600',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
  },
  DELIVERED: {
    label: 'Livrée avec succès',
    description: 'Le colis a été remis en main propre au destinataire.',
    stepIndex: 4,
    colorClass: 'text-emerald-600',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  CANCELLED: {
    label: 'Commande Annulée',
    description: 'Cette commande a été annulée.',
    stepIndex: -1,
    colorClass: 'text-rose-600',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
  },
};

/**
 * Libellé lisible pour les méthodes de paiement
 */
export function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case 'CASH':
      return 'Espèces à la livraison';
    case 'MOBILE_MONEY':
      return 'Mobile Money (Wave / Orange / MTN / Moov)';
    default:
      return method;
  }
}

/**
 * Formate une date en français
 */
export function formatDateFR(dateString: string | Date | undefined): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
