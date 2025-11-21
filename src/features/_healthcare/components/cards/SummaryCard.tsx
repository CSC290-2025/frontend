import React from 'react';
import type { LucideIcon } from 'lucide-react';

const ACCENTS = {
  cyan: 'text-cyan-600',
  amber: 'text-amber-600',
  violet: 'text-violet-600',
  rose: 'text-rose-600',
  emerald: 'text-emerald-600',
};

type AccentKey = keyof typeof ACCENTS;

interface SummaryCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  accent?: AccentKey;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  accent = 'cyan',
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4">
    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50">
      <Icon className={`h-5 w-5 ${ACCENTS[accent]}`} />
    </div>
    <div className="text-3xl font-bold text-gray-900">{value}</div>
    <p className="text-sm font-semibold text-gray-600">{label}</p>
    {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
  </div>
);
