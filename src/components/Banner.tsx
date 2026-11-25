import React from 'react';
import { Sparkles, ShieldCheck, Truck, Clock, Flame } from 'lucide-react';

export default function Banner() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-950 via-zinc-900 to-brand-950 border border-zinc-800 text-white shadow-xl mb-8">
      {/* Glow decorative orbs */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

      <div className="relative px-6 py-8 sm:px-10 sm:py-12 z-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="max-w-2xl text-center md:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 font-semibold text-xs tracking-wider uppercase">
            <Flame className="w-4 h-4 text-brand-500 animate-pulse" />
            Vente Flash de la Semaine • Jusqu'à -30%
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
            Les Meilleurs Produits High-Tech & Tendance au <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-amber-300">Meilleur Prix FCFA</span>
          </h1>

          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
            Commandez en 1 clic sans créer de compte. Payez en toute sécurité à la livraison en espèces ou par Mobile Money (Wave, Orange, MTN, Moov).
          </p>

          {/* Points forts */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm text-zinc-300">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span>Livraison 24h Abidjan</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span>Paiement à la réception</span>
            </div>
            <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
              <Clock className="w-4 h-4 text-brand-400 flex-shrink-0" />
              <span>Suivi en temps réel</span>
            </div>
          </div>
        </div>

        {/* Promo Badge Callout */}
        <div className="flex-shrink-0 bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 border border-brand-500/30 p-6 rounded-2xl text-center shadow-2xl backdrop-blur-sm max-w-xs w-full">
          <div className="w-12 h-12 mx-auto rounded-full bg-brand-500/20 text-brand-400 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-xs uppercase font-bold tracking-widest text-zinc-400">Offre Spéciale</span>
          <div className="text-2xl font-black text-white mt-1">LIVRAISON RAPIDE</div>
          <p className="text-xs text-zinc-400 mt-1">À partir de <span className="text-brand-400 font-bold">1 500 FCFA</span> dans tout Abidjan</p>
          <div className="mt-4 pt-3 border-t border-zinc-700/60 text-[11px] text-zinc-400 flex items-center justify-center gap-1">
            <span>📞 Service Client & WhatsApp actif</span>
          </div>
        </div>
      </div>
    </div>
  );
}
