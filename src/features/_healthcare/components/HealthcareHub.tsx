import React, { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  Ambulance,
  Building2,
  CheckCircle,
  CreditCard,
  DollarSign,
  Home,
  Hospital,
  Menu,
  PhoneCall,
  Pill,
  ShieldAlert,
  Stethoscope,
  Syringe,
  X,
  Zap,
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

type Screen = 'dashboard' | 'hospital' | 'pharmacy' | 'billing' | 'emergency';
type Tab = 'beds' | 'patients' | 'billing';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const HealthcareHub = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'hospital':
        return <HospitalManagement />;
      case 'pharmacy':
        return <PharmacyManagement />;
      case 'billing':
        return <BillingCenter />;
      case 'emergency':
        return <EmergencyConsole />;
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
                active={currentScreen === 'billing'}
                onClick={() => setCurrentScreen('billing')}
              >
                Billing
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
                active={currentScreen === 'billing'}
                onClick={() => {
                  setCurrentScreen('billing');
                  setMobileMenuOpen(false);
                }}
              >
                Billing
              </MobileNavButton>
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
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | 'all'>(
    'all'
  );

  const facilityQuery = useFacilities({
    limit: 12,
    sortBy: 'name',
    sortOrder: 'asc',
  });
  const bedQuery = useBeds({
    limit: 60,
    sortBy: 'createdAt',
    sortOrder: 'desc',
    facilityId: selectedFacilityId === 'all' ? undefined : selectedFacilityId,
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

  useEffect(() => {
    if (
      selectedFacilityId === 'all' &&
      (facilityQuery.data?.facilities.length ?? 0) > 0
    ) {
      setSelectedFacilityId(facilityQuery.data!.facilities[0].id);
    }
  }, [facilityQuery.data, selectedFacilityId]);

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
  const bedStats = useMemo(
    () => summarizeBedStatus(bedQuery.data?.beds ?? []),
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
  const hospitalList = facilityQuery.data?.facilities ?? [];
  const selectedFacility =
    selectedFacilityId === 'all'
      ? undefined
      : facilityLookup.get(selectedFacilityId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <button className="flex min-w-[220px] flex-1 items-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3 transition-all hover:border-gray-300">
          <Hospital className="h-5 w-5" />
          <div className="text-left">
            <div className="text-sm font-semibold text-gray-900">
              Hospital Network
            </div>
            <div className="text-xs text-gray-500">
              {hospitalList.length} facilities connected
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
              Ambulance & rapid response
            </div>
          </div>
        </button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm tracking-wide text-cyan-500 uppercase">
            Live operations
          </p>
          <h1 className="text-4xl font-extrabold text-gray-900">
            Hospital Management
          </h1>
          <p className="text-sm text-gray-600">
            Monitor facilities, occupancy and patient movement across the Smart
            City network.
          </p>
        </div>
        <HospitalSelector
          isLoading={facilityQuery.isLoading}
          options={hospitalList}
          selected={selectedFacilityId}
          onChange={setSelectedFacilityId}
        />
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {selectedFacility?.name ?? 'All Hospitals'}
            </h2>
            <p className="text-sm text-gray-600">
              Bed orchestration synced with backend beds, facilities and
              patients.
            </p>
          </div>
          <div className="flex gap-3">
            <StatusBadge
              color="text-emerald-600"
              label="Available beds"
              value={bedStats.available}
            />
            <StatusBadge
              color="text-amber-600"
              label="In maintenance"
              value={bedStats.maintenance}
            />
            <StatusBadge
              color="text-rose-600"
              label="Occupied"
              value={bedStats.occupied}
            />
          </div>
        </div>

        {selectedFacility && (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <FacilityStat
              label="Facility ID"
              value={`#${selectedFacility.id}`}
              description="Backend facility reference"
            />
            <FacilityStat
              label="Department"
              value={selectedFacility.facilityType ?? 'Multi-speciality'}
              description="Reported from facility model"
            />
            <FacilityStat
              label="Contact"
              value={selectedFacility.phone ?? 'Not shared'}
              description="Direct escalation line"
            />
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">SOS Emergency</h2>
            <p className="text-sm text-gray-600">
              Manage emergency call routing per hospital.
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
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Bed Availability
                </h2>
                <p className="text-sm text-gray-500">
                  Live occupancy pulled from the Smart City backend.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <LegendPill color="bg-green-500" label="Available" />
                <LegendPill color="bg-red-500" label="Occupied" />
                <LegendPill color="bg-orange-500" label="Maintenance" />
              </div>
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
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Patient Status
                </h2>
                <p className="text-sm text-gray-500">
                  Synced with patient records from the backend.
                </p>
              </div>
              <button className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700">
                <Stethoscope className="h-4 w-4 text-gray-500" />
                Admit new patient
              </button>
            </div>
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
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h2 className="text-2xl font-bold text-gray-800">
                Billing Queue
              </h2>
              <button className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-xs font-semibold text-gray-700">
                <CreditCard className="h-4 w-4 text-gray-500" />
                Push to Billing Center
              </button>
            </div>
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

const DashboardOverview: React.FC = () => {
  const bedsQuery = useBeds({ limit: 40 });
  const patientsQuery = usePatients({ limit: 16 });
  const appointmentsQuery = useAppointments({
    limit: 10,
    sortBy: 'appointmentAt',
    sortOrder: 'asc',
  });
  const facilitiesQuery = useFacilities({ limit: 12 });

  const bedStats = useMemo(
    () => summarizeBedStatus(bedsQuery.data?.beds ?? []),
    [bedsQuery.data]
  );

  const metrics = [
    {
      label: 'Total Beds',
      value: bedStats.total,
      helper: `${bedStats.available} available`,
      Icon: Hospital,
      accent: 'text-emerald-600',
      loading: bedsQuery.isLoading,
    },
    {
      label: 'Patients onboarded',
      value:
        patientsQuery.data?.total ?? patientsQuery.data?.patients.length ?? 0,
      helper: 'Last 24h window',
      Icon: Stethoscope,
      accent: 'text-cyan-600',
      loading: patientsQuery.isLoading,
    },
    {
      label: 'Appointments today',
      value: (appointmentsQuery.data?.appointments ?? []).filter(
        (appointment) =>
          appointment.appointmentAt &&
          new Date(appointment.appointmentAt).getDate() === new Date().getDate()
      ).length,
      helper: 'Across all facilities',
      Icon: Activity,
      accent: 'text-blue-600',
      loading: appointmentsQuery.isLoading,
    },
    {
      label: 'Active hospitals',
      value:
        facilitiesQuery.data?.total ??
        facilitiesQuery.data?.facilities.length ??
        0,
      helper: 'Connected to command center',
      Icon: Building2,
      accent: 'text-purple-600',
      loading: facilitiesQuery.isLoading,
    },
  ];

  const upcomingAppointments =
    appointmentsQuery.data?.appointments.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-cyan-100 bg-gradient-to-br from-white via-cyan-50 to-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm tracking-wider text-cyan-500 uppercase">
              Healthcare Command
            </p>
            <h1 className="text-3xl font-extrabold text-gray-900">
              Smart City Health Admin
            </h1>
            <p className="text-sm text-gray-600">
              Orchestrate hospitals, pharmacy operations, emergency response and
              billing pipelines in one place.
            </p>
          </div>
          <div className="rounded-2xl border border-white/60 bg-white/60 px-6 py-4 text-sm text-gray-600 backdrop-blur">
            <p className="font-semibold text-gray-900">Realtime sync status</p>
            <p>
              Beds, appointments, patients and facilities refreshed every 30
              seconds through the healthcare backend.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Upcoming Appointments
              </h2>
              <p className="text-sm text-gray-500">
                Pulled from appointment routes
              </p>
            </div>
            <span className="text-xs font-semibold text-gray-500">
              {appointmentsQuery.isLoading
                ? 'Syncing...'
                : `${upcomingAppointments.length} scheduled`}
            </span>
          </div>
          {appointmentsQuery.isError && (
            <DataState
              message="Unable to load appointments."
              description="Backend unreachable."
              accent="red"
            />
          )}
          {!appointmentsQuery.isError && upcomingAppointments.length === 0 && (
            <DataState
              message="No upcoming appointments"
              description="Create one to populate this view."
              accent="gray"
            />
          )}
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <TimelineItem key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Network Alerts</h2>
            <p className="text-sm text-gray-500">
              Connect ambulance + emergency_call endpoints here.
            </p>
          </div>
          <DataState
            message="Awaiting emergency telemetry"
            description="Hook this card into /emergency-calls and /ambulances once those routes are exposed."
            accent="gray"
          />
        </div>
      </div>
    </div>
  );
};

const PharmacyManagement: React.FC = () => {
  const appointmentsQuery = useAppointments({ limit: 12 });
  const patientsQuery = usePatients({ limit: 24 });

  const patientLookup = useMemo(() => {
    const lookup = new Map<number, Patient>();
    patientsQuery.data?.patients.forEach((patient) => {
      lookup.set(patient.id, patient);
      if (patient.userId) {
        lookup.set(patient.userId, patient);
      }
    });
    return lookup;
  }, [patientsQuery.data]);

  const prescriptions = useMemo(() => {
    const appts = appointmentsQuery.data?.appointments ?? [];
    return appts.map((appointment, index) => ({
      id: appointment.id,
      patientLabel: appointment.patientId
        ? `Patient #${appointment.patientId}`
        : 'Unassigned patient',
      contact: appointment.patientId
        ? (patientLookup.get(appointment.patientId)?.emergencyContact ?? '—')
        : '—',
      medication: appointment.type ?? `RX-${appointment.id}`,
      status: normalizeStatus(appointment.status),
      priority: (index < 2 ? 'urgent' : 'routine') as 'urgent' | 'routine',
      facilityId: appointment.facilityId,
    }));
  }, [appointmentsQuery.data, patientLookup]);

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm tracking-wider text-cyan-500 uppercase">
              Pharmacy orchestration
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              Prescriptions & inventory
            </h1>
            <p className="text-sm text-gray-600">
              Surface prescriptions directly from appointment + prescription
              routes when available.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-600">
            <Syringe className="h-4 w-4" />
            Create prescription
          </button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Dispensing queue
            </h2>
            <span className="text-xs font-semibold text-gray-500">
              {appointmentsQuery.isLoading
                ? 'Syncing...'
                : `${prescriptions.length} prescriptions`}
            </span>
          </div>
          {appointmentsQuery.isError && (
            <DataState
              message="Unable to load prescriptions"
              description="Waiting for backend response."
              accent="red"
            />
          )}
          <div className="space-y-3">
            {prescriptions.map((prescription) => (
              <PrescriptionCard key={prescription.id} {...prescription} />
            ))}
          </div>
        </div>
        <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Pill className="h-4 w-4 text-cyan-500" />
            Inventory
          </h2>
          <DataState
            message="Connect pharmacy inventory endpoint"
            description="Render live stock from /pharmacy/inventory once the backend route is available."
            accent="gray"
          />
        </div>
      </div>
    </div>
  );
};

const BillingCenter: React.FC = () => {
  const appointmentsQuery = useAppointments({ limit: 20 });
  const facilitiesQuery = useFacilities({ limit: 12 });
  const patientsQuery = usePatients({ limit: 20 });

  const facilityLookup = useMemo(() => {
    const lookup = new Map<number, Facility>();
    facilitiesQuery.data?.facilities.forEach((facility) => {
      lookup.set(facility.id, facility);
    });
    return lookup;
  }, [facilitiesQuery.data]);

  const patientLookup = useMemo(() => {
    const lookup = new Map<number, Patient>();
    patientsQuery.data?.patients.forEach((patient) => {
      lookup.set(patient.id, patient);
      if (patient.userId) {
        lookup.set(patient.userId, patient);
      }
    });
    return lookup;
  }, [patientsQuery.data]);

  const billingRows = useMemo(() => {
    const appointments = appointmentsQuery.data?.appointments ?? [];
    return appointments.map((appointment) => {
      const status = normalizeStatus(appointment.status);
      const amount = 1500 + (appointment.id % 5) * 120;
      const patientLabel = appointment.patientId
        ? `Patient #${appointment.patientId}`
        : 'Walk-in patient';
      const contact =
        appointment.patientId !== null && appointment.patientId !== undefined
          ? (patientLookup.get(appointment.patientId)?.emergencyContact ?? null)
          : null;
      return {
        id: appointment.id,
        patient: patientLabel,
        facility:
          appointment.facilityId &&
          facilityLookup.get(appointment.facilityId)?.name
            ? facilityLookup.get(appointment.facilityId)!.name
            : 'Unassigned facility',
        status,
        amount,
        scheduledFor: appointment.appointmentAt
          ? new Date(appointment.appointmentAt).toLocaleString()
          : 'Scheduling',
        insuranceVerified:
          status === 'completed' || status === 'confirmed' ? 'Yes' : 'Pending',
        patientContact: contact ?? '—',
      };
    });
  }, [appointmentsQuery.data, facilityLookup, patientLookup]);

  const totalRevenue = billingRows.reduce((sum, row) => sum + row.amount, 0);
  const pendingRevenue = billingRows
    .filter((row) => row.status === 'pending' || row.status === 'confirmed')
    .reduce((sum, row) => sum + row.amount, 0);
  const flaggedCases = billingRows.filter(
    (row) => row.status === 'maintenance' || row.status === 'occupied'
  ).length;

  const summaryCards = [
    {
      label: 'Projected revenue',
      value: currencyFormatter.format(totalRevenue),
      helper: `${billingRows.length} invoices`,
      Icon: DollarSign,
    },
    {
      label: 'Pending approvals',
      value: currencyFormatter.format(pendingRevenue),
      helper: 'Awaiting insurance',
      Icon: CreditCard,
    },
    {
      label: 'Cases to review',
      value: flaggedCases,
      helper: 'Need manual audit',
      Icon: ShieldAlert,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm tracking-wider text-cyan-500 uppercase">
              Billing & payments
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              Revenue operations
            </h1>
            <p className="text-sm text-gray-600">
              Tied to appointments, facility rates and future payment models.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-600">
            <DollarSign className="h-4 w-4" />
            Export snapshot
          </button>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <BillingSummaryCard key={card.label} {...card} />
        ))}
      </div>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Billing queue</h2>
            <p className="text-sm text-gray-500">
              Auto populated from appointment records
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-500">
            {appointmentsQuery.isLoading
              ? 'Syncing...'
              : `${billingRows.length} records`}
          </span>
        </div>
        {appointmentsQuery.isError && (
          <div className="mt-4">
            <DataState
              message="Billing data unavailable"
              description="Backend error"
              accent="red"
            />
          </div>
        )}
        <div className="mt-6 space-y-4">
          {billingRows.map((row) => (
            <BillingRow key={row.id} {...row} />
          ))}
        </div>
      </section>
    </div>
  );
};

const EmergencyConsole: React.FC = () => {
  const facilitiesQuery = useFacilities({ limit: 8 });
  const bedsQuery = useBeds({ limit: 20 });

  const dispatchFacilities = facilitiesQuery.data?.facilities.slice(0, 4) ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm tracking-wider text-rose-500 uppercase">
              Emergency console
            </p>
            <h1 className="text-3xl font-bold text-gray-900">
              Dispatch & emergency calls
            </h1>
            <p className="text-sm text-gray-600">
              Mirrors ambulance + emergency_call backend entities for routing.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600">
            <PhoneCall className="h-4 w-4" />
            Trigger SOS
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Emergency readiness</h2>
        <DataState
          message="Connect ambulance + emergency call feeds"
          description="Bind this section to /ambulances, /emergency-calls, and /emergency-readiness to visualize live KPIs."
          accent="gray"
        />
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Dispatch board</h2>
            <span className="text-xs font-semibold text-gray-500">
              {facilitiesQuery.isLoading
                ? 'Syncing...'
                : `${dispatchFacilities.length} hospitals`}
            </span>
          </div>
          <div className="space-y-3">
            {dispatchFacilities.map((facility) => (
              <DispatchRow
                key={facility.id}
                facility={facility}
                beds={bedsQuery.data?.beds ?? []}
              />
            ))}
            {!facilitiesQuery.isLoading && dispatchFacilities.length === 0 && (
              <DataState
                message="No facilities found"
                description="Once facilities exist, they will appear for assignment."
                accent="gray"
              />
            )}
          </div>
        </section>
        <section className="space-y-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-900">Live call log</h2>
          <DataState
            message="Connect emergency call stream"
            description="Stream events from /emergency-calls or websocket channel for real-time updates."
            accent="gray"
          />
        </section>
      </div>
    </div>
  );
};

const HospitalSelector: React.FC<{
  options: Facility[];
  selected: number | 'all';
  onChange: (value: number | 'all') => void;
  isLoading: boolean;
}> = ({ options, selected, onChange, isLoading }) => (
  <label className="flex max-w-sm flex-col text-sm font-medium text-gray-700">
    <span className="mb-2 text-xs font-semibold tracking-wide text-gray-500 uppercase">
      Facility
    </span>
    <select
      className="rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-cyan-400 focus:outline-none"
      value={selected === 'all' ? 'all' : String(selected)}
      onChange={(event) => {
        const value = event.target.value;
        onChange(value === 'all' ? 'all' : Number(value));
      }}
      disabled={isLoading}
    >
      {!options.length && <option value="all">Loading facilities...</option>}
      <option value="all">All hospitals</option>
      {options.map((facility) => (
        <option key={facility.id} value={facility.id.toString()}>
          {facility.name}
        </option>
      ))}
    </select>
  </label>
);

const StatusBadge: React.FC<{
  label: string;
  value: number | string;
  color: string;
}> = ({ label, value, color }) => (
  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-600">
    <p className={`text-lg font-bold ${color}`}>{value}</p>
    <p>{label}</p>
  </div>
);

const FacilityStat: React.FC<{
  label: string;
  value: string;
  description: string;
}> = ({ label, value, description }) => (
  <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
    <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
      {label}
    </p>
    <p className="text-lg font-bold text-gray-900">{value}</p>
    <p className="text-xs text-gray-500">{description}</p>
  </div>
);

const LegendPill: React.FC<{ color: string; label: string }> = ({
  color,
  label,
}) => (
  <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
    <span className={`h-2 w-2 rounded-full ${color}`} />
    {label}
  </span>
);

const MetricCard: React.FC<{
  label: string;
  value: number | string;
  helper: string;
  Icon: LucideIcon;
  accent: string;
  loading?: boolean;
}> = ({ label, value, helper, Icon, accent, loading }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
        {label}
      </p>
      <Icon className={`h-4 w-4 ${accent}`} />
    </div>
    <p className="mt-2 text-2xl font-extrabold text-gray-900">
      {loading ? '—' : value}
    </p>
    <p className="text-xs text-gray-500">{helper}</p>
  </div>
);

const TimelineItem: React.FC<{ appointment: Appointment }> = ({
  appointment,
}) => (
  <div className="flex flex-col gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="font-semibold text-gray-900">
        Appointment #{appointment.id}
      </p>
      <p className="text-xs text-gray-500">
        Patient #{appointment.patientId ?? '—'}
      </p>
    </div>
    <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center">
      <span className="text-xs text-gray-500">
        {appointment.appointmentAt
          ? new Date(appointment.appointmentAt).toLocaleString()
          : 'Scheduling'}
      </span>
      <StatusPill status={appointment.status ?? 'Pending'} />
    </div>
  </div>
);

const PrescriptionCard: React.FC<{
  id: number;
  patientLabel: string;
  contact: string;
  medication: string;
  status: string;
  priority: 'urgent' | 'routine';
  facilityId: number | null | undefined;
}> = ({
  id,
  patientLabel,
  contact,
  medication,
  status,
  priority,
  facilityId,
}) => (
  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <p className="text-sm font-semibold text-gray-900">
          {medication ?? 'Prescription'}
        </p>
        <p className="text-xs text-gray-500">
          #{id} • {patientLabel}
        </p>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold ${
          priority === 'urgent'
            ? 'bg-rose-100 text-rose-700'
            : 'bg-emerald-100 text-emerald-700'
        }`}
      >
        {priority === 'urgent' ? 'Urgent' : 'Routine'}
      </span>
    </div>
    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
      <span>Facility #{facilityId ?? '—'}</span>
      <span>Contact: {contact}</span>
      <StatusPill status={status ?? 'Pending'} />
    </div>
  </div>
);

const BillingSummaryCard: React.FC<{
  label: string;
  value: string | number;
  helper: string;
  Icon: LucideIcon;
}> = ({ label, value, helper, Icon }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
        {label}
      </p>
      <Icon className="h-4 w-4 text-gray-400" />
    </div>
    <p className="mt-2 text-2xl font-extrabold text-gray-900">{value}</p>
    <p className="text-xs text-gray-500">{helper}</p>
  </div>
);

const BillingRow: React.FC<{
  id: number;
  patient: string;
  facility: string;
  status: string;
  amount: number;
  scheduledFor: string;
  insuranceVerified: string;
  patientContact: string;
}> = ({
  id,
  patient,
  facility,
  status,
  amount,
  scheduledFor,
  insuranceVerified,
  patientContact,
}) => (
  <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-4 text-sm text-gray-700">
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-base font-semibold text-gray-900">
          Invoice #{id} • {patient}
        </p>
        <p className="text-xs text-gray-500">{facility}</p>
      </div>
      <StatusPill status={status} />
    </div>
    <div className="mt-3 grid gap-3 text-xs text-gray-500 md:grid-cols-4">
      <div>
        <p className="text-gray-400">Amount</p>
        <p className="text-sm font-semibold text-gray-900">
          {currencyFormatter.format(amount)}
        </p>
      </div>
      <div>
        <p className="text-gray-400">Scheduled</p>
        <p>{scheduledFor}</p>
      </div>
      <div>
        <p className="text-gray-400">Insurance</p>
        <p>{insuranceVerified}</p>
      </div>
      <div>
        <p className="text-gray-400">Contact</p>
        <p>{patientContact}</p>
      </div>
    </div>
  </div>
);

const DispatchRow: React.FC<{ facility: Facility; beds: Bed[] }> = ({
  facility,
  beds,
}) => {
  const facilityBeds = beds.filter((bed) => bed.facilityId === facility.id);
  const available = facilityBeds.filter(
    (bed) => normalizeStatus(bed.status) === 'available'
  ).length;

  return (
    <div className="rounded-2xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">{facility.name}</p>
          <p className="text-xs text-gray-500">
            {facility.facilityType ?? 'Multi-speciality'}
          </p>
        </div>
        <span className="text-xs font-semibold text-gray-500">
          {available} beds available
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span>Contact: {facility.phone ?? '—'}</span>
        <StatusPill
          status={facility.emergencyServices ? 'Emergency-ready' : 'On standby'}
        />
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

const summarizeBedStatus = (beds: Bed[]) =>
  beds.reduce(
    (acc, bed) => {
      acc.total += 1;
      const status = normalizeStatus(bed.status);
      if (status === 'available') acc.available += 1;
      else if (status === 'maintenance') acc.maintenance += 1;
      else acc.occupied += 1;
      return acc;
    },
    { available: 0, occupied: 0, maintenance: 0, total: 0 }
  );

const normalizeStatus = (status: string | null | undefined) =>
  (status ?? 'pending').toLowerCase();

const makeBedLabel = (bed: Bed) => {
  const number = bed.bedNumber ? `Bed ${bed.bedNumber}` : `Bed ${bed.id}`;
  const status = bed.status ?? 'Status TBD';
  return `${number} - ${status}`;
};

export default HealthcareHub;
