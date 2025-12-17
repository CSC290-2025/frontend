import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import UserOverviewPage from '@/features/_healthcare/pages/user/UserOverviewPage';
import UserBookingPage from '@/features/_healthcare/pages/user/UserBookingPage';
import UserMedicationsPage from '@/features/_healthcare/pages/user/UserMedicationsPage';
import UserBillingPage from '@/features/_healthcare/pages/user/UserBillingPage';
import UserProfilePage from '@/features/_healthcare/pages/user/UserProfilePage';
import AdminHealthcareShell from '@/features/_healthcare/pages/AdminHealthcareShell';

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
  const [mode, setMode] = useState<'user' | 'admin-login' | 'admin'>('user');
  const [currentScreen, setCurrentScreen] = useState<UserScreen>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [emergencyContact, setEmergencyContact] = useState('');

  if (mode === 'admin') {
    return <AdminHealthcareShell />;
  }

  if (mode === 'admin-login') {
    return (
      <AdminLoginView
        onBack={() => setMode('user')}
        onSuccess={() => setMode('admin')}
      />
    );
  }

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
            onAdminLoginRequest={() => setMode('admin-login')}
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

const AdminLoginView: React.FC<{
  onBack: () => void;
  onSuccess: () => void;
}> = ({ onBack, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSuccess();
  };

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <button
          onClick={onBack}
          className="text-sm font-semibold text-[#0091B5] hover:underline"
        >
          ← Back to Healthcare
        </button>
        <div className="mt-4 space-y-2">
          <h1 className="text-2xl font-extrabold text-gray-900">
            Healthcare Staff Login
          </h1>
          <p className="text-sm text-gray-600">
            Enter the staff email and password provided by the admin team.
            Signup is disabled for security.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block space-y-1 text-sm font-semibold text-gray-700">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#01CCFF] focus:outline-none"
              placeholder="staff@hospital.com"
            />
          </label>
          <label className="block space-y-1 text-sm font-semibold text-gray-700">
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#01CCFF] focus:outline-none"
              placeholder="••••••••"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-lg bg-[#0091B5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#007fa0]"
          >
            Login to Admin
          </button>
        </form>
      </div>
    </div>
  );
};
