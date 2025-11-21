import React from 'react';
import { Menu, User, Settings, Wallet, LogOut } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Category {
  id: string;
  icon: LucideIcon;
  label: string;
  subtitle: string;
}

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  categories: Category[];
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  selectedCategory,
  setSelectedCategory,
  categories,
}) => {
  return (
    <div
      className={`${sidebarOpen ? 'w-64' : 'w-20'} flex flex-col border-r border-gray-200 bg-white transition-all duration-300`}
    >
      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto p-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`mb-2 flex w-full items-center gap-3 rounded-lg p-3 transition-colors ${
              selectedCategory === cat.id
                ? 'bg-cyan-50 text-cyan-600'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <cat.icon className="h-5 w-5 flex-shrink-0" />
            {sidebarOpen && (
              <div className="text-left">
                <div className="text-sm font-medium">{cat.label}</div>
                <div className="text-xs text-gray-500">{cat.subtitle}</div>
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Menu */}
      <div className="border-t border-gray-200 p-3">
        <button className="flex w-full items-center gap-3 rounded-lg p-3 text-gray-700 hover:bg-gray-100">
          <User className="h-5 w-5 flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Profile</span>}
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg p-3 text-gray-700 hover:bg-gray-100">
          <Settings className="h-5 w-5 flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Setting</span>}
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg p-3 text-gray-700 hover:bg-gray-100">
          <Wallet className="h-5 w-5 flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">E-wallet</span>}
        </button>
        <button className="flex w-full items-center gap-3 rounded-lg p-3 text-red-600 hover:bg-gray-100">
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {sidebarOpen && <span className="text-sm font-medium">Log out</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
