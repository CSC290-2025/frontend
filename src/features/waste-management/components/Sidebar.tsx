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
  BusFront,
} from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  const menuItems = [
    {
      id: 'dashboard',
      icon: Building2,
      label: 'City insights',
      subtitle: 'Dashboard and quick service',
    },
    {
      id: 'transportation',
      icon: BusFront,
      label: 'ransport',
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
    <div className="fixed top-0 left-0 flex h-screen w-60 flex-col border-r border-gray-200 bg-white">
      <div className="border-b p-4">
        <h2 className="text-2xl font-bold text-cyan-500">
          City<span className="text-gray-800">Hub</span>
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto pt-4">
        {menuItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`mx-3 mb-2 cursor-pointer rounded-lg px-4 py-3 hover:bg-gray-100 ${
              currentPage === item.id
                ? 'bg-cyan-50 text-cyan-600'
                : 'text-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          </div>
        ))}

        <hr className="my-4" />

        <div
          className="mx-3 mb-2 cursor-pointer rounded-lg px-4 py-3 hover:bg-gray-100"
          onClick={() => onNavigate('profile')}
        >
          <div className="flex items-center gap-3">
            <User size={20} />
            <span className="text-sm font-medium">Profile</span>
          </div>
        </div>

        <div
          className="mx-3 mb-2 cursor-pointer rounded-lg px-4 py-3 hover:bg-gray-100"
          onClick={() => onNavigate('setting')}
        >
          <div className="flex items-center gap-3">
            <Settings size={20} />
            <span className="text-sm font-medium">Setting</span>
          </div>
        </div>

        <div
          className="mx-3 mb-2 cursor-pointer rounded-lg px-4 py-3 hover:bg-gray-100"
          onClick={() => onNavigate('ewallet')}
        >
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
