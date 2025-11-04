import React, { useState } from 'react';
import {
  //Building2,
  //Pill,
  //Calendar,
  Ambulance,
  //Phone,
  //MapPin,
  //CreditCard,
  //Home,
  Hospital,
  Zap,
  Menu,
  X,
  CheckCircle,
} from 'lucide-react';

type Screen = 'dashboard' | 'hospital' | 'pharmacy' | 'booking' | 'emergency';

const HealthcareHub: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('hospital');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {/* Navigation Header */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <div className="text-lg font-bold text-gray-800">
                  Smart City
                </div>
                <div className="text-xs text-gray-500">Healthcare Hub</div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden space-x-2 md:flex">
              <NavButton
                active={currentScreen === 'dashboard'}
                onClick={() => setCurrentScreen('dashboard')}
              >
                Dashboard
              </NavButton>
              <NavButton
                active={currentScreen === 'hospital'}
                onClick={() => setCurrentScreen('hospital')}
              >
                Hospital
              </NavButton>
              <NavButton
                active={currentScreen === 'pharmacy'}
                onClick={() => setCurrentScreen('pharmacy')}
              >
                Pharmacy
              </NavButton>
              <NavButton
                active={currentScreen === 'booking'}
                onClick={() => setCurrentScreen('booking')}
              >
                Booking
              </NavButton>
            </div>

            {/* Emergency Button & Mobile Menu */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setCurrentScreen('emergency')}
                className="flex items-center space-x-2 rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
              >
                <Ambulance className="h-4 w-4" />
                <span className="hidden sm:inline">Emergency</span>
              </button>

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t border-gray-200 bg-white md:hidden">
            <div className="space-y-2 px-4 py-3">
              <MobileNavButton
                active={currentScreen === 'dashboard'}
                onClick={() => {
                  setCurrentScreen('dashboard');
                  setMobileMenuOpen(false);
                }}
              >
                Dashboard
              </MobileNavButton>
              <MobileNavButton
                active={currentScreen === 'hospital'}
                onClick={() => {
                  setCurrentScreen('hospital');
                  setMobileMenuOpen(false);
                }}
              >
                Hospital
              </MobileNavButton>
              <MobileNavButton
                active={currentScreen === 'pharmacy'}
                onClick={() => {
                  setCurrentScreen('pharmacy');
                  setMobileMenuOpen(false);
                }}
              >
                Pharmacy
              </MobileNavButton>
              <MobileNavButton
                active={currentScreen === 'booking'}
                onClick={() => {
                  setCurrentScreen('booking');
                  setMobileMenuOpen(false);
                }}
              >
                Booking
              </MobileNavButton>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {currentScreen === 'hospital' && <HospitalManagement />}
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
    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
      active ? 'bg-cyan-500 text-white' : 'text-gray-600 hover:bg-gray-100'
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
    className={`w-full rounded-lg px-4 py-3 text-left text-sm font-semibold transition-all ${
      active ? 'bg-cyan-500 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`}
  >
    {children}
  </button>
);

const HospitalManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'beds' | 'patients' | 'billing'>(
    'beds'
  );

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb Tabs */}
      <div className="flex gap-4">
        <button className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 transition-all hover:border-gray-300">
          <Hospital className="h-5 w-5" />
          <div className="text-left">
            <div
              className="text-sm font-semibold"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Hospital
            </div>
            <div
              className="text-xs text-gray-500"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Hospital & Emergency services
            </div>
          </div>
        </button>
        <button className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 transition-all hover:border-gray-300">
          <Zap className="h-5 w-5" />
          <div className="text-left">
            <div
              className="text-sm font-semibold"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Emergency services
            </div>
            <div
              className="text-xs text-gray-500"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Hospital & Emergency services
            </div>
          </div>
        </button>
      </div>

      {/* Main Title */}
      <h1
        className="text-4xl font-extrabold text-gray-900"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        Hospital Management
      </h1>

      {/* SOS Emergency Contact Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2
              className="mb-1 text-lg font-bold text-gray-900"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              SOS Emergency
            </h2>
            <p
              className="text-sm text-gray-600"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Emergency contact Management
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:max-w-2xl md:flex-1">
            <div className="flex-1">
              <label
                className="mb-1 block text-xs text-gray-600"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Primary Contact
              </label>
              <input
                type="text"
                placeholder="XXXX"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </div>
            <div className="flex-1">
              <label
                className="mb-1 block text-xs text-gray-600"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Secondary Contact
              </label>
              <input
                type="text"
                placeholder="ZZZZZZ"
                className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-transparent focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              />
            </div>
            <div className="flex items-end">
              <button
                className="w-full rounded-xl bg-cyan-400 px-6 py-2.5 text-sm font-semibold whitespace-nowrap text-white transition-all hover:bg-cyan-500 sm:w-auto"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                Update Contacts
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('beds')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === 'beds'
                ? 'border-b-2 border-blue-600 bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Bed Availability
          </button>
          <button
            onClick={() => setActiveTab('patients')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === 'patients'
                ? 'border-b-2 border-blue-600 bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Patient Status
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex-1 px-6 py-4 text-sm font-semibold transition-all ${
              activeTab === 'billing'
                ? 'border-b-2 border-blue-600 bg-blue-50 text-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            style={{ fontFamily: 'Poppins, sans-serif' }}
          >
            Billing
          </button>
        </div>

        {/* Bed Availability Content */}
        {activeTab === 'beds' && (
          <div className="p-8">
            <h2
              className="mb-6 text-2xl font-bold text-gray-700"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Bed Availability Dashboard
            </h2>

            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
              {/* ICU Ward */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3
                  className="mb-4 text-base font-bold text-gray-900"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  ICU Ward
                </h3>
                <div className="space-y-3">
                  <BedStatus id="101" status="available" label="Available" />
                  <BedStatus id="102" status="occupied" label="Occupied" />
                  <BedStatus
                    id="103"
                    status="maintenance"
                    label="Maintenance"
                  />
                </div>
              </div>

              {/* General Ward */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3
                  className="mb-4 text-base font-bold text-gray-900"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  General Ward
                </h3>
                <div className="space-y-3">
                  <BedStatus id="201" status="available" label="Available" />
                  <BedStatus id="202" status="available" label="Available" />
                  <BedStatus
                    id="203"
                    status="maintenance"
                    label="Maintenance"
                  />
                </div>
              </div>

              {/* Emergency */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <h3
                  className="mb-4 text-base font-bold text-gray-900"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Emergency
                </h3>
                <div className="space-y-3">
                  <BedStatus id="301" status="available" label="Ready" />
                  <BedStatus id="302" status="available" label="Ready" />
                </div>
              </div>
            </div>

            {/* Finance & Housing Integration */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Finance Integration */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h3
                  className="mb-4 text-lg font-bold text-gray-900"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Finance Integration
                </h3>

                <div className="mb-4 space-y-3">
                  <div className="flex items-start">
                    <span
                      className="text-sm font-semibold text-gray-700"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      Patient
                    </span>
                    <span
                      className="ml-2 text-sm text-gray-600"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      : John Doe
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span
                      className="text-sm font-semibold text-gray-700"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      Insurance
                    </span>
                    <span
                      className="ml-2 text-sm text-gray-600"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      : Verified
                    </span>
                    <CheckCircle className="ml-1 h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-start">
                    <span
                      className="text-sm font-semibold text-gray-700"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      Pre-auth
                    </span>
                    <span
                      className="ml-2 text-sm text-gray-600"
                      style={{ fontFamily: 'Poppins, sans-serif' }}
                    >
                      : Approved
                    </span>
                  </div>
                </div>

                <div
                  className="mb-4 text-lg font-bold text-gray-900"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Est. Cost : $2,500
                </div>

                <button
                  className="w-full rounded-xl bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-cyan-500 sm:w-auto"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Process Billing
                </button>
              </div>

              {/* House Integration */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6">
                <h3
                  className="mb-4 text-lg font-bold text-gray-900"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  House Integration
                </h3>

                <div className="mb-4">
                  <h4
                    className="mb-3 text-sm font-semibold text-gray-700"
                    style={{ fontFamily: 'Poppins, sans-serif' }}
                  >
                    Family Accommodation
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm text-gray-600"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        🏨 Family Hotel
                      </span>
                      <span
                        className="text-sm font-semibold text-gray-900"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        $89/night
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span
                        className="text-sm text-gray-600"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        🏠 Guest House
                      </span>
                      <span
                        className="text-sm font-semibold text-gray-900"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        $65/night
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className="mb-4 flex items-center text-sm text-gray-600"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  <span className="mr-1 text-red-500">↑</span>
                  <span className="font-medium">Walking Distance</span>
                  <span className="ml-2">: 2 blocks</span>
                </div>

                <button
                  className="w-full rounded-xl bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-cyan-500 sm:w-auto"
                  style={{ fontFamily: 'Poppins, sans-serif' }}
                >
                  Book Room
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="p-8">
            <p
              className="text-gray-600"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Patient Status content coming soon...
            </p>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="p-8">
            <p
              className="text-gray-600"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Billing content coming soon...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const BedStatus: React.FC<{
  id: string;
  status: 'available' | 'occupied' | 'maintenance';
  label: string;
}> = ({ id, status, label }) => {
  const statusColors = {
    available: 'bg-green-500',
    occupied: 'bg-red-500',
    maintenance: 'bg-orange-500',
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <span
        className="text-sm text-gray-700"
        style={{ fontFamily: 'Poppins, sans-serif' }}
      >
        Bed {id} - {label}
      </span>
      <div className={`h-3 w-3 rounded-full ${statusColors[status]}`}></div>
    </div>
  );
};

export default HealthcareHub;
