import React from 'react';
import { normalizeStatus } from '@/features/_healthcare/utils';

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  occupied: 'bg-red-100 text-red-700',
  maintenance: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  pending: 'bg-gray-100 text-gray-700',
  completed: 'bg-emerald-100 text-emerald-700',
};

interface StatusPillProps {
  status: string | null | undefined;
}

export const StatusPill: React.FC<StatusPillProps> = ({ status }) => {
  const normalized = normalizeStatus(status);
  const colors = STATUS_COLORS[normalized] ?? STATUS_COLORS.pending;

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${colors}`}>
      {status ?? 'Pending'}
    </span>
  );
};
