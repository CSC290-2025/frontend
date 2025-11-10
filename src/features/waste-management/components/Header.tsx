import { Trophy, User, Package, Trash2 } from 'lucide-react';

interface HeaderProps {
  onNavigate: (page: string) => void;
}

export function Header({ onNavigate }: HeaderProps) {
  const cardStyle =
    'bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer';

  return (
    <div className="mb-6 grid grid-cols-4 gap-4">
      <div className={cardStyle} onClick={() => onNavigate('events')}>
        <Trophy className="mb-2 text-cyan-500" size={24} />
        <h3 className="font-semibold">Events</h3>
        <p className="text-sm text-gray-500">Activities and volunteer</p>
      </div>
      <div className={cardStyle} onClick={() => onNavigate('freecycle')}>
        <Package className="mb-2 text-cyan-500" size={24} />
        <h3 className="font-semibold">Free cycle</h3>
        <p className="text-sm text-gray-500">Give and get free items</p>
      </div>
      <div className={cardStyle} onClick={() => onNavigate('volunteer')}>
        <User className="mb-2 text-cyan-500" size={24} />
        <h3 className="font-semibold">Volunteer</h3>
        <p className="text-sm text-gray-500">Join a good cause</p>
      </div>
      <div className={cardStyle} onClick={() => onNavigate('waste')}>
        <Trash2 className="mb-2 text-cyan-500" size={24} />
        <h3 className="font-semibold">Waste Management</h3>
        <p className="text-sm text-gray-500">Report and track</p>
      </div>
    </div>
  );
}
