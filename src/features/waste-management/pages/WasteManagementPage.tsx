import { useState } from 'react';
import { BarChart3, MapPin, Trash2, Navigation, Calendar } from 'lucide-react';
import Dashboard from '@/features/waste-management/pages/Dashboard.tsx';
import BinsManagement from '@/features/waste-management/pages/BinsManagement';
import WasteLogging from '@/features/waste-management/pages/WasteLogging';
import { BinLocator } from '@/features/waste-management/pages/NearestBins';
import WasteEventsPage from './WasteEventsPage';

export default function WasteManagementPage() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'waste':
        return <WasteLogging />;
      case 'bins':
        return <BinsManagement />;
      case 'nearest':
        return <BinLocator />;
      case 'wasteEvent':
        return <WasteEventsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Waste Management System
                </h1>
                <p className="text-sm text-gray-500">
                  Smart waste tracking and monitoring
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'waste', label: 'Log Waste', icon: Trash2 },
              { id: 'bins', label: 'Bins Management', icon: MapPin },
              { id: 'nearest', label: 'Find Nearest Bins', icon: Navigation },
              { id: 'wasteEvent', label: 'Waste Events', icon: Calendar },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 transition ${
                  currentPage === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {renderPage()}
      </main>
    </div>
  );
}
