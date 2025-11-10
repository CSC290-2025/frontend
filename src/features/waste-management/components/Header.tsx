import { Trophy, Package, User, Trash2 } from 'lucide-react';

export function QuickLinksHeader({
  onNavigate,
}: {
  onNavigate: (page: string) => void;
}) {
  return (
    <div className="mb-6 grid grid-cols-4 gap-4">
      <div
        className="cursor-pointer rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
        onClick={() => onNavigate('events')}
      >
        <Trophy className="mb-2" size={24} />
        <h3 className="font-semibold">Events</h3>
        <p className="text-sm text-gray-500">Activities and volunteer</p>
      </div>
      <div className="cursor-pointer rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <Package className="mb-2" size={24} />
        <h3 className="font-semibold">Free cycle</h3>
        <p className="text-sm text-gray-500">Activities and volunteer</p>
      </div>
      <div className="cursor-pointer rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <User className="mb-2" size={24} />
        <h3 className="font-semibold">Volunteer</h3>
        <p className="text-sm text-gray-500">Activities and volunteer</p>
      </div>
      <div className="cursor-pointer rounded-xl bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <Trash2 className="mb-2" size={24} />
        <h3 className="font-semibold">Waste Management</h3>
        <p className="text-sm text-gray-500">Activities and volunteer</p>
      </div>
    </div>
  );
}
