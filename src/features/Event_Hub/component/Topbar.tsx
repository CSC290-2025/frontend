import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface TopCategory {
  id: string;
  icon: LucideIcon;
  label: string;
  subtitle: string;
}

interface TopBarProps {
  topCategories: TopCategory[];
}

const TopBar: React.FC<TopBarProps> = ({ topCategories }) => {
  return (
    <div className="border-b border-gray-200 bg-white p-6">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {topCategories.map((cat) => (
          <div
            key={cat.id}
            className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-50">
              <cat.icon className="h-6 w-6 text-cyan-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-800">{cat.label}</div>
              <div className="text-xs text-gray-500">{cat.subtitle}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopBar;
