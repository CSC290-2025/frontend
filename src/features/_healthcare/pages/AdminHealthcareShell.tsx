import React, { useState } from 'react';
import { Ambulance, Menu, X } from 'lucide-react';
import AdminDashboardPage from '@/features/_healthcare/pages/admin/AdminDashboardPage';
import AdminHospitalPage from '@/features/_healthcare/pages/admin/AdminHospitalPage';
import AdminPharmacyPage from '@/features/_healthcare/pages/admin/AdminPharmacyPage';
import AdminBillingPage from '@/features/_healthcare/pages/admin/AdminBillingPage';
import AdminEmergencyPage from '@/features/_healthcare/pages/admin/AdminEmergencyPage';

type AdminScreen =
  | 'admin-dashboard'
  | 'admin-hospital'
  | 'admin-pharmacy'
  | 'admin-billing'
  | 'admin-emergency';

const navItems: Array<{ key: AdminScreen; label: string }> = [
  { key: 'admin-dashboard', label: 'Dashboard' },
  { key: 'admin-hospital', label: 'Hospital' },
  { key: 'admin-pharmacy', label: 'Pharmacy' },
  { key: 'admin-billing', label: 'Billing' },
];

const AdminHealthcareShell: React.FC = () => {
  const [currentScreen, setCurrentScreen] =
    useState<AdminScreen>('admin-dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'admin-dashboard':
        return <AdminDashboardPage />;
      case 'admin-hospital':
        return <AdminHospitalPage />;
      case 'admin-pharmacy':
        return <AdminPharmacyPage />;
      case 'admin-billing':
        return <AdminBillingPage />;
      case 'admin-emergency':
        return <AdminEmergencyPage />;
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div>
              <div className="text-lg font-bold text-gray-800">Smart City</div>
              <div className="text-xs text-gray-500">Healthcare Hub</div>
            </div>

            <div className="hidden space-x-2 md:flex">
              {navItems.map((item) => (
                <NavButton
                  key={item.key}
                  active={currentScreen === item.key}
                  onClick={() => setCurrentScreen(item.key)}
                >
                  {item.label}
                </NavButton>
              ))}
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setCurrentScreen('admin-emergency')}
                className="flex items-center space-x-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                <Ambulance className="h-4 w-4" />
                <span className="hidden sm:inline">Emergency</span>
              </button>
              <button
                onClick={() => setMobileMenuOpen((open) => !open)}
                className="rounded-lg p-2 hover:bg-gray-100 md:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white md:hidden">
            <div className="space-y-2 px-4 py-3">
              {navItems.map((item) => (
                <MobileNavButton
                  key={`mobile-${item.key}`}
                  active={currentScreen === item.key}
                  onClick={() => {
                    setCurrentScreen(item.key);
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </MobileNavButton>
              ))}
            </div>
          </div>
        )}
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {renderScreen()}
      </main>
    </div>
  );
};

const NavButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
      active
        ? 'bg-[#01CCFF] text-white'
        : 'text-gray-600 hover:bg-[#0091B5] hover:text-white'
    }`}
  >
    {children}
  </button>
);

const MobileNavButton: React.FC<{
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`w-full rounded-lg px-4 py-3 text-left text-sm font-semibold transition ${
      active
        ? 'bg-[#01CCFF] text-white'
        : 'text-gray-600 hover:bg-[#0091B5] hover:text-white'
    }`}
  >
    {children}
  </button>
);

export default AdminHealthcareShell;
