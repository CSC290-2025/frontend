import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick?: () => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon: Icon,
  title,
  description,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-gray-300"
  >
    <span className="rounded-xl bg-gray-50 p-2">
      <Icon className="h-4 w-4 text-gray-600" />
    </span>
    <div>
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  </button>
);
