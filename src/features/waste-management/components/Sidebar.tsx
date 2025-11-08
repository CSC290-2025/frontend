import {
  Trophy,
  User,
  Cloud,
  Building2,
  Brain,
  Phone,
  Settings,
  Wallet,
  LogOut,
  Package,
} from 'lucide-react';

export function Sidebar({
  currentPage,
  onNavigate,
}: {
  currentPage: string;
  onNavigate: (page: string) => void;
}) {
  const menuItems = [
    {
      id: 'dashboard',
      icon: Building2,
      label: 'City insights',
      subtitle: 'Dashboard and quick service',
    },
    {
      id: 'transport',
      icon: Package,
      label: 'Transport',
      subtitle: 'Bus timing and routes',
    },
    {
      id: 'events',
      icon: Trophy,
      label: 'Events',
      subtitle: 'Activities and volunteer',
    },
    {
      id: 'weather',
      icon: Cloud,
      label: 'Weather reports',
      subtitle: 'Forecast & Air Quality',
    },
    {
      id: 'healthcare',
      icon: Building2,
      label: 'Healthcare',
      subtitle: 'Hospital & Emergency services',
    },
    {
      id: 'knowai',
      icon: Brain,
      label: 'Know Ai',
      subtitle: 'Learning with AI',
    },
    {
      id: 'contact',
      icon: Phone,
      label: 'Contact us',
      subtitle: 'report issues',
    },
  ];

  return (
    <div className="flex h-screen w-48 flex-col border-r border-gray-200 bg-white">
      <div className="flex-1 overflow-y-auto">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`cursor-pointer border-b border-gray-100 p-4 hover:bg-gray-50 ${
              currentPage === item.id ? 'bg-gray-50' : ''
            }`}
          >
            <div className="mb-1 flex items-center gap-3">
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <p className="ml-8 text-xs text-gray-500">{item.subtitle}</p>
          </div>
        ))}

        <div className="cursor-pointer border-b border-gray-100 p-4 hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <User size={20} />
            <span className="text-sm font-medium">Profile</span>
          </div>
        </div>

        <div className="cursor-pointer border-b border-gray-100 p-4 hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <Settings size={20} />
            <span className="text-sm font-medium">Setting</span>
          </div>
        </div>

        <div className="cursor-pointer p-4 hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <Wallet size={20} />
            <span className="text-sm font-medium">E-wallet</span>
          </div>
        </div>
      </div>

      <button className="m-4 flex items-center justify-center gap-2 rounded-lg bg-cyan-400 py-3 text-white hover:bg-cyan-500">
        <LogOut size={20} />
        <span>Log out</span>
      </button>
    </div>
  );
}
