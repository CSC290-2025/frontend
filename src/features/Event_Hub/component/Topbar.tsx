import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface TopCategory {
  id: string;
  icon: LucideIcon;
  label: string;
  subtitle?: string;
}

interface TopBarProps {
  topCategories: TopCategory[];
  onSelectCategory?: (categoryId: string) => void;
}

const TopBar: React.FC<TopBarProps> = ({ topCategories, onSelectCategory }) => {
  return (
    <div className="border-b border-gray-200 bg-white p-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {topCategories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelectCategory?.(cat.id)}
            disabled={!onSelectCategory}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 text-left transition-all hover:border-cyan-200 hover:shadow-md disabled:cursor-default disabled:opacity-60"
            aria-label={`Open ${cat.label}`}
          >
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-cyan-50">
              <cat.icon className="h-6 w-6 text-cyan-600" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-semibold text-gray-800">
                {cat.label}
              </div>
              <div className="truncate text-xs text-gray-500">
                {cat.subtitle || `View ${cat.label}`}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TopBar;
