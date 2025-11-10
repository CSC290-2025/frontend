// --- src/components/MobileHeader.tsx ---
import { Menu } from 'lucide-react';

interface MobileHeaderProps {
  onOpenSidebar: () => void;
}

export function MobileHeader({ onOpenSidebar }: MobileHeaderProps) {
  return (
    <header className="fixed top-0 right-0 left-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white p-4 md:hidden">
      <h2 className="text-2xl font-bold text-cyan-500">
        City<span className="text-gray-800">Hub</span>
      </h2>
      <button onClick={onOpenSidebar} className="p-2 text-gray-700">
        <Menu size={24} />
      </button>
    </header>
  );
}
