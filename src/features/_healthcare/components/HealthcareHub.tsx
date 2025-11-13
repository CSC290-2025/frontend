import React, { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Ambulance,
  Hospital,
  Zap,
  Menu,
  X,
  CheckCircle,
  Home,
} from 'lucide-react';
import {
  useAppointments,
  useBeds,
  useFacilities,
  usePatients,
} from '@/features/_healthcare/hooks/useHealthcareData';
import type {
  Appointment,
  Bed,
  Facility,
  Patient,
} from '@/features/_healthcare/types';

type Screen = 'dashboard' | 'hospital' | 'pharmacy' | 'booking' | 'emergency';
type Tab = 'beds' | 'patients' | 'billing';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const HealthcareHub: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('hospital');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen bg-gray-50"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
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
  const [activeTab, setActiveTab] = useState<Tab>('beds');

  const bedQuery = useBeds({
    limit: 30,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const facilityQuery = useFacilities({
    limit: 10,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const patientQuery = usePatients({
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const appointmentQuery = useAppointments({
    limit: 12,
    sortBy: 'appointmentAt',
    sortOrder: 'asc',
  });

  const patientContacts = useMemo(
    () =>
      (patientQuery.data?.patients ?? [])
        .map((patient) => patient.emergencyContact?.trim())
        .filter((contact): contact is string =>
          Boolean(contact && contact.length)
        ),
    [patientQuery.data]
  );

  const [primaryContact, setPrimaryContact] = useState('');
  const [secondaryContact, setSecondaryContact] = useState('');

  useEffect(() => {
    setPrimaryContact(patientContacts[0] ?? '');
    setSecondaryContact(patientContacts[1] ?? '');
  }, [patientContacts]);

  const bedBuckets = useMemo(
    () => categorizeBeds(bedQuery.data?.beds ?? []),
    [bedQuery.data]
  );

  const facilityLookup = useMemo(() => {
    const lookup = new Map<number, Facility>();
    facilityQuery.data?.facilities.forEach((facility) => {
      lookup.set(facility.id, facility);
    });
    return lookup;
  }, [facilityQuery.data]);

  const patientLookup = useMemo(() => {
    const lookup = new Map<number, Patient>();
    patientQuery.data?.patients.forEach((patient) => {
      if (patient.userId) {
        lookup.set(patient.userId, patient);
      }
      lookup.set(patient.id, patient);
    });
    return lookup;
  }, [patientQuery.data]);

  const featuredAppointment = appointmentQuery.data?.appointments[0];
  const featuredPatient =
    (featuredAppointment?.patientId &&
      patientLookup.get(featuredAppointment.patientId)) ||
    patientQuery.data?.patients[0];

  const accommodationOptions = facilityQuery.data?.facilities.slice(0, 2) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <button className="flex min-w-[220px] flex-1 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 transition-all hover:border-gray-300">
          <Hospital className="h-5 w-5" />
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-900">Hospital</div>
            <div className="text-xs text-gray-500">
              Hospital & Emergency services
            </div>
          </div>
        </button>
        <button className="flex min-w-[220px] flex-1 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 transition-all hover:border-gray-300">
          <Zap className="h-5 w-5" />
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-900">
              Emergency services
            </div>
            <div className="text-xs text-gray-500">
              Hospital & Emergency services
            </div>
          </div>
        </button>
      </div>

      <h1 className="text-4xl font-extrabold text-gray-900">
        Hospital Management
      </h1>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">SOS Emergency</h2>
            <p className="text-sm text-gray-600">
              Emergency contact Management
            </p>
          </div>
          {patientQuery.isError && (
            <span className="text-sm font-semibold text-red-500">
              Unable to load contacts
            </span>
          )}
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <label className="flex flex-1 flex-col">
            <span className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Primary Contact
            </span>
            <input
              value={primaryContact}
              onChange={(event) => setPrimaryContact(event.target.value)}
              placeholder="XXXX"
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 focus:outline-none"
            />
          </label>
          <label className="flex flex-1 flex-col">
            <span className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Secondary Contact
            </span>
            <input
              value={secondaryContact}
              onChange={(event) => setSecondaryContact(event.target.value)}
              placeholder="ZZZZZZ"
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 focus:outline-none"
            />
          </label>
          <div className="flex items-end">
            <button className="w-full rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-cyan-600 sm:w-auto">
              Update Contacts
            </button>
          </div>
        </div>
      </section>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex border-b border-gray-200">
          <TabButton
            tab="beds"
            current={activeTab}
            onClick={() => setActiveTab('beds')}
          >
            Bed Availability
          </TabButton>
          <TabButton
            tab="patients"
            current={activeTab}
            onClick={() => setActiveTab('patients')}
          >
            Patient Status
          </TabButton>
          <TabButton
            tab="billing"
            current={activeTab}
            onClick={() => setActiveTab('billing')}
          >
            Billing
          </TabButton>
        </div>

        {activeTab === 'beds' && (
          <div className="space-y-8 p-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">
                Bed Availability Dashboard
              </h2>
              <p className="text-sm text-gray-500">
                Live occupancy pulled from the Smart City backend.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <WardCard
                title="ICU Ward"
                beds={bedBuckets.icu}
                isLoading={bedQuery.isLoading}
              />
              <WardCard
                title="General Ward"
                beds={bedBuckets.general}
                isLoading={bedQuery.isLoading}
              />
              <WardCard
                title="Emergency"
                beds={bedBuckets.emergency}
                isLoading={bedQuery.isLoading}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <FinanceCard
                appointment={featuredAppointment}
                patient={featuredPatient}
              />
              <HouseCard
                facilities={accommodationOptions}
                isLoading={facilityQuery.isLoading}
              />
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="space-y-6 p-8">
            <h2 className="text-2xl font-bold text-gray-800">Patient Status</h2>
            {patientQuery.isLoading && (
              <DataState message="Loading patients..." accent="cyan" />
            )}
            {patientQuery.isError && (
              <DataState
                message="Failed to load patients."
                description="Please refresh to try again."
                accent="red"
              />
            )}
            {!patientQuery.isLoading &&
              !patientQuery.isError &&
              (patientQuery.data?.patients.length ?? 0) === 0 && (
                <DataState
                  message="No patients found"
                  description="Add a patient record to see it here."
                  accent="gray"
                />
              )}
            <div className="grid gap-4 md:grid-cols-2">
              {patientQuery.data?.patients.map((patient) => (
                <PatientCard key={patient.id} patient={patient} />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6 p-8">
            <h2 className="text-2xl font-bold text-gray-800">Billing Queue</h2>
            {appointmentQuery.isLoading && (
              <DataState message="Loading appointments..." accent="cyan" />
            )}
            {appointmentQuery.isError && (
              <DataState
                message="Unable to load billing data."
                description="Please try again later."
                accent="red"
              />
            )}
            {!appointmentQuery.isLoading &&
              !appointmentQuery.isError &&
              (appointmentQuery.data?.appointments.length ?? 0) === 0 && (
                <DataState
                  message="No appointments scheduled"
                  description="Create an appointment to see billing progress."
                  accent="gray"
                />
              )}
            <div className="space-y-4">
              {appointmentQuery.data?.appointments.map((appointment) => (
                <BillingCard
                  key={appointment.id}
                  appointment={appointment}
                  facilityLookup={facilityLookup}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TabButton: React.FC<{
  tab: Tab;
  current: Tab;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ tab, current, onClick, children }) => (
  <button
    onClick={onClick}
    className={`flex-1 border-b-2 px-6 py-4 text-sm font-semibold transition-all ${
      tab === current
        ? 'border-blue-600 bg-blue-50 text-blue-600'
        : 'border-transparent text-gray-600 hover:bg-gray-50'
    }`}
  >
    {children}
  </button>
);

const WardCard: React.FC<{
  title: string;
  beds: Bed[];
  isLoading: boolean;
}> = ({ title, beds, isLoading }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5">
    <h3 className="mb-4 text-base font-bold text-gray-900">{title}</h3>
    {isLoading && <DataState message="Syncing beds..." accent="gray" compact />}
    {!isLoading && beds.length === 0 && (
      <DataState
        message="No beds mapped to this ward"
        description="Update bed types to classify them."
        accent="gray"
        compact
      />
    )}
    <div className="space-y-3">
      {beds.slice(0, 4).map((bed) => (
        <BedStatus key={bed.id} bed={bed} />
      ))}
    </div>
  </div>
);

const BedStatus: React.FC<{ bed: Bed }> = ({ bed }) => {
  const status = normalizeStatus(bed.status);
  const statusColors: Record<string, string> = {
    available: 'bg-green-500',
    occupied: 'bg-red-500',
    maintenance: 'bg-orange-500',
  };

  const color = statusColors[status] ?? 'bg-gray-400';
  const label = makeBedLabel(bed);

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <span className="text-sm text-gray-700">{label}</span>
      <div className={`h-3 w-3 rounded-full ${color}`}></div>
    </div>
  );
};

const FinanceCard: React.FC<{
  appointment?: Appointment;
  patient?: Patient;
}> = ({ appointment, patient }) => {
  const appointmentStatus = appointment?.status ?? 'Pending';
  const insuranceStatus = patient?.emergencyContact
    ? 'Verified'
    : 'Needs update';

  const estimatedCost = appointment
    ? currencyFormatter.format(2000 + appointment.id * 5)
    : currencyFormatter.format(2500);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-bold text-gray-900">
        Finance Integration
      </h3>
      <div className="mb-4 space-y-3">
        <InfoRow label="Patient" value={`#${appointment?.patientId ?? '—'}`} />
        <InfoRow label="Insurance" value={insuranceStatus} icon={CheckCircle} />
        <InfoRow label="Pre-auth" value={appointmentStatus} />
      </div>
      <div className="mb-4 text-lg font-bold text-gray-900">
        Est. Cost : {estimatedCost}
      </div>
      <button className="w-full rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-cyan-600 sm:w-auto">
        Process Billing
      </button>
    </div>
  );
};

const HouseCard: React.FC<{
  facilities: Facility[];
  isLoading: boolean;
}> = ({ facilities, isLoading }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6">
    <h3 className="mb-4 text-lg font-bold text-gray-900">House Integration</h3>
    <div className="mb-4">
      <h4 className="mb-3 text-sm font-semibold text-gray-700">
        Family Accommodation
      </h4>
      {isLoading && (
        <DataState message="Loading facilities..." accent="gray" compact />
      )}
      {!isLoading && facilities.length === 0 && (
        <DataState
          message="No facilities available"
          description="Register housing partners to show options."
          accent="gray"
          compact
        />
      )}
      <div className="space-y-2">
        {facilities.map((facility) => (
          <div
            key={facility.id}
            className="flex items-center justify-between text-sm text-gray-600"
          >
            <span>
              <Home className="mr-2 inline h-4 w-4 text-gray-400" />
              {facility.name}
            </span>
            <span className="font-semibold text-gray-900">
              {facility.phone ?? facility.facilityType ?? 'Contact TBD'}
            </span>
          </div>
        ))}
      </div>
    </div>

    <div className="mb-4 flex items-center text-sm text-gray-600">
      <span className="mr-1 text-red-500">↑</span>
      <span className="font-medium">Walking Distance</span>
      <span className="ml-2">
        :{' '}
        {facilities[0]?.addressId
          ? `${facilities[0].addressId} blocks`
          : '2 blocks'}
      </span>
    </div>

    <button className="w-full rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-cyan-600 sm:w-auto">
      Book Room
    </button>
  </div>
);

const PatientCard: React.FC<{ patient: Patient }> = ({ patient }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-900">
          Patient #{patient.id}
        </p>
        <p className="text-xs text-gray-500">
          Emergency contact:{' '}
          <span className="font-medium text-gray-700">
            {patient.emergencyContact ?? 'Not provided'}
          </span>
        </p>
      </div>
      <span className="text-xs text-gray-400">
        Created {new Date(patient.createdAt).toLocaleDateString()}
      </span>
    </div>
  </div>
);

const BillingCard: React.FC<{
  appointment: Appointment;
  facilityLookup: Map<number, Facility>;
}> = ({ appointment, facilityLookup }) => {
  const facilityLabel = appointment.facilityId
    ? (facilityLookup.get(appointment.facilityId)?.name ??
      `Facility #${appointment.facilityId}`)
    : 'Unassigned';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-semibold text-gray-900">
            Appointment #{appointment.id}
          </p>
          <p className="text-xs text-gray-500">{facilityLabel}</p>
        </div>
        <StatusPill status={appointment.status ?? 'Pending'} />
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {appointment.appointmentAt
          ? new Date(appointment.appointmentAt).toLocaleString()
          : 'Scheduling'}
      </div>
    </div>
  );
};

const StatusPill: React.FC<{ status: string }> = ({ status }) => {
  const normalized = normalizeStatus(status);
  const colors: Record<string, string> = {
    available: 'bg-green-100 text-green-700',
    occupied: 'bg-red-100 text-red-700',
    maintenance: 'bg-amber-100 text-amber-700',
    completed: 'bg-emerald-100 text-emerald-700',
    confirmed: 'bg-blue-100 text-blue-700',
    pending: 'bg-gray-100 text-gray-700',
  };

  const style = colors[normalized] ?? 'bg-gray-100 text-gray-700';

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {status ?? 'Pending'}
    </span>
  );
};

const InfoRow: React.FC<{
  label: string;
  value: string;
  icon?: LucideIcon;
}> = ({ label, value, icon: Icon }) => (
  <div className="flex items-center text-sm text-gray-700">
    <span className="font-semibold">{label}</span>
    <span className="mx-2 text-gray-400">:</span>
    {Icon && <Icon className="mr-1 h-4 w-4 text-green-500" />}
    <span>{value}</span>
  </div>
);

const DataState: React.FC<{
  message: string;
  description?: string;
  accent: 'cyan' | 'red' | 'gray';
  compact?: boolean;
}> = ({ message, description, accent, compact }) => {
  const accents = {
    cyan: 'text-cyan-600',
    red: 'text-red-600',
    gray: 'text-gray-500',
  }[accent];

  return (
    <div
      className={`rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 ${
        compact ? 'py-3' : 'py-6'
      } text-center`}
    >
      <p className={`text-sm font-semibold ${accents}`}>{message}</p>
      {description && (
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
};

const categorizeBeds = (beds: Bed[]) => {
  const buckets = {
    icu: [] as Bed[],
    general: [] as Bed[],
    emergency: [] as Bed[],
  };

  beds.forEach((bed) => {
    const type = (bed.bedType ?? '').toLowerCase();
    if (type.includes('icu')) {
      buckets.icu.push(bed);
    } else if (type.includes('emerg')) {
      buckets.emergency.push(bed);
    } else {
      buckets.general.push(bed);
    }
  });

  return buckets;
};

const normalizeStatus = (status: string | null | undefined) =>
  (status ?? 'pending').toLowerCase();

const makeBedLabel = (bed: Bed) => {
  const number = bed.bedNumber ? `Bed ${bed.bedNumber}` : `Bed ${bed.id}`;
  const status = bed.status ?? 'Status TBD';
  return `${number} - ${status}`;
};

export default HealthcareHub;
