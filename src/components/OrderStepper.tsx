'use client';

import React from 'react';
import { CheckCircle2, Clock, Check, Truck, PackageCheck, XCircle } from 'lucide-react';
import { OrderStatus } from '@/types';
import { ORDER_STATUS_DETAILS } from '@/lib/utils';

interface OrderStepperProps {
  status: OrderStatus;
}

const STEPS = [
  {
    key: 'PENDING' as OrderStatus,
    step: 1,
    title: 'Commande reçue',
    subtitle: 'En attente de validation',
    icon: Clock,
  },
  {
    key: 'CONFIRMED' as OrderStatus,
    step: 2,
    title: 'Confirmée',
    subtitle: 'Préparée en entrepôt',
    icon: CheckCircle2,
  },
  {
    key: 'SHIPPING' as OrderStatus,
    step: 3,
    title: 'En livraison',
    subtitle: 'Colis confié au coursier',
    icon: Truck,
  },
  {
    key: 'DELIVERED' as OrderStatus,
    step: 4,
    title: 'Livrée',
    subtitle: 'Remise au client',
    icon: PackageCheck,
  },
];

export default function OrderStepper({ status }: OrderStepperProps) {
  const isCancelled = status === 'CANCELLED';
  const currentStepIndex = ORDER_STATUS_DETAILS[status]?.stepIndex || 1;

  if (isCancelled) {
    return (
      <div className="bg-rose-950/40 border border-rose-800/60 rounded-2xl p-6 text-center text-rose-200">
        <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400 mb-3">
          <XCircle className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-rose-300">Cette commande a été annulée</h3>
        <p className="text-xs text-rose-400 mt-1 max-w-md mx-auto">
          Pour toute réclamation ou réactivation de votre commande, veuillez contacter le service client.
        </p>
      </div>
    );
  }

  return (
    <div className="py-6 px-4 bg-zinc-900/70 border border-zinc-800 rounded-2xl">
      <div className="relative">
        {/* Progress connecting line */}
        <div className="absolute top-5 left-8 right-8 h-1 bg-zinc-800 -z-0 hidden md:block">
          <div
            className="h-full bg-brand-500 transition-all duration-700 ease-out"
            style={{
              width: `${((currentStepIndex - 1) / (STEPS.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 md:gap-2 relative z-10">
          {STEPS.map((step) => {
            const isCompleted = currentStepIndex > step.step;
            const isCurrent = currentStepIndex === step.step;
            const Icon = step.icon;

            return (
              <div
                key={step.key}
                className="flex md:flex-col items-center md:text-center gap-4 md:gap-2"
              >
                {/* Step Circle Indicator */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md ${
                    isCompleted
                      ? 'bg-emerald-500 text-zinc-950 shadow-emerald-500/20'
                      : isCurrent
                      ? 'bg-brand-500 text-zinc-950 ring-4 ring-brand-500/20 shadow-brand-500/30'
                      : 'bg-zinc-800 text-zinc-500 border border-zinc-700'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[3]" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>

                {/* Step Text Info */}
                <div className="flex-1 md:flex-initial">
                  <div className="flex items-center gap-2 md:justify-center">
                    <span
                      className={`text-xs font-black tracking-tight ${
                        isCurrent
                          ? 'text-brand-400'
                          : isCompleted
                          ? 'text-white'
                          : 'text-zinc-500'
                      }`}
                    >
                      {step.title}
                    </span>
                    {isCurrent && (
                      <span className="inline-block w-2 h-2 rounded-full bg-brand-500 animate-ping md:hidden" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">{step.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
