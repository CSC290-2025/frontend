import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import UserOverviewPage from '@/features/_healthcare/pages/user/UserOverviewPage';
import UserBookingPage from '@/features/_healthcare/pages/user/UserBookingPage';
import UserMedicationsPage from '@/features/_healthcare/pages/user/UserMedicationsPage';
import UserBillingPage from '@/features/_healthcare/pages/user/UserBillingPage';
import UserProfilePage from '@/features/_healthcare/pages/user/UserProfilePage';

type UserScreen =
  | 'overview'
  | 'book-appointment'
  | 'medications'
  | 'billing'
  | 'profile';

const navItems: Array<{ key: UserScreen; label: string }> = [
  { key: 'overview', label: 'Overview' },
  { key: 'book-appointment', label: 'Book' },
  { key: 'medications', label: 'Medications' },
  { key: 'billing', label: 'Billing' },
  { key: 'profile', label: 'Profile' },
];

const UserHealthcareShell: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<UserScreen>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState('');

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
              <div className="text-xs text-gray-500">
                Healthcare Hub — Citizen
              </div>
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
        {currentScreen === 'overview' && (
          <UserOverviewPage
            emergencyContact={emergencyContact}
            onContactChange={setEmergencyContact}
          />
        )}
        {currentScreen === 'book-appointment' && <UserBookingPage />}
        {currentScreen === 'medications' && <UserMedicationsPage />}
        {currentScreen === 'billing' && <UserBillingPage />}
        {currentScreen === 'profile' && (
          <UserProfilePage
            emergencyContact={emergencyContact}
            onContactChange={setEmergencyContact}
          />
        )}
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

export default UserHealthcareShell;
