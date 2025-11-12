import React from 'react';
import type { MetroCardItem } from './AmountBox';
import { CreditCard } from 'lucide-react';

interface MetroCardProps {
  card: MetroCardItem;
}

export default function MetroCard({ card }: MetroCardProps) {
  const formatCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  return (
    <div
      key={card.id}
      className={`relative rounded-2xl p-6 text-white shadow-lg transition-shadow hover:shadow-xl ${
        card.status === 'suspended'
          ? 'bg-gray-400/80'
          : 'bg-gradient-to-br from-cyan-400 to-blue-500'
      }`}
    >
      <div className="mb-8 flex items-start justify-between">
        <div className="rounded-lg bg-white/20 p-2 backdrop-blur-sm">
          <CreditCard className="h-6 w-6" />
        </div>
        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium uppercase backdrop-blur-sm">
          {card.status.toUpperCase()}
        </span>
      </div>

      <div className="mb-6">
        <p className="mb-1 text-sm text-white/80">Card Number</p>
        <p className="font-mono text-lg font-semibold tracking-wider">
          {formatCardNumber(card.card_number)}
        </p>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="mb-1 text-sm text-white/80">Balance</p>
          <p className="text-2xl font-bold">
            {Number(card.balance).toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-white/80">Metro Card</p>
        </div>
      </div>

      <div className="absolute top-1/2 right-8 opacity-10">
        <CreditCard className="h-32 w-32" />
      </div>
    </div>
  );
}
