import React, { useEffect, useMemo, useState } from 'react';
import { Hospital, Zap, Activity, Users, Building2 } from 'lucide-react';
import {
  useAppointments,
  useBeds,
  useFacilities,
  usePatients,
} from '@/features/_healthcare/hooks/useHealthcareData';
import { SummaryCard } from '@/features/_healthcare/components/cards/SummaryCard';
import { EmergencyContactsCard } from '@/features/_healthcare/components/cards/EmergencyContactsCard';
import { BedWardCard } from '@/features/_healthcare/components/cards/BedWardCard';
import { FinanceCard } from '@/features/_healthcare/components/cards/FinanceCard';
import { HousingCard } from '@/features/_healthcare/components/cards/HousingCard';
import { AppointmentCard } from '@/features/_healthcare/components/cards/AppointmentCard';
import { PatientCard } from '@/features/_healthcare/components/cards/PatientCard';
import { DataState } from '@/features/_healthcare/components/common/DataState';
import { categorizeBeds, summarizeBeds } from '@/features/_healthcare/utils';
import type { Facility, Patient } from '@/features/_healthcare/types';

const AdminHospitalPage: React.FC = () => {
  const [selectedFacilityId, setSelectedFacilityId] = useState<number | 'all'>(
    'all'
  );
  const bedsQuery = useBeds({ limit: 50, sortBy: 'createdAt' });
  const facilitiesQuery = useFacilities({ limit: 30, sortBy: 'name' });
  const appointmentsQuery = useAppointments({
    limit: 10,
    sortBy: 'appointmentAt',
    sortOrder: 'asc',
  });
  const patientsQuery = usePatients({ limit: 20, sortBy: 'createdAt' });

  const patientContacts = useMemo(
    () =>
      (patientsQuery.data?.patients ?? [])
        .map((patient) => patient.emergencyContact?.trim())
        .filter((contact): contact is string => Boolean(contact)),
    [patientsQuery.data]
  );

  const [primaryContact, setPrimaryContact] = useState('');
  const [secondaryContact, setSecondaryContact] = useState('');

  useEffect(() => {
    setPrimaryContact(patientContacts[0] ?? '');
    setSecondaryContact(patientContacts[1] ?? '');
  }, [patientContacts]);

  const facilityLookup = useMemo(() => {
    const lookup = new Map<number, Facility>();
    facilitiesQuery.data?.facilities.forEach((facility) =>
      lookup.set(facility.id, facility)
    );
    return lookup;
  }, [facilitiesQuery.data]);

  const patientLookup = useMemo(() => {
    const lookup = new Map<number, Patient>();
    patientsQuery.data?.patients.forEach((patient) => {
      if (patient.userId) lookup.set(patient.userId, patient);
      lookup.set(patient.id, patient);
    });
    return lookup;
  }, [patientsQuery.data]);

  const selectedFacility =
    selectedFacilityId === 'all'
      ? null
      : facilityLookup.get(selectedFacilityId);

  const filteredBeds = useMemo(() => {
    const beds = bedsQuery.data?.beds ?? [];
    if (!selectedFacility?.id) return beds;
    return beds.filter((bed) => bed.facilityId === selectedFacility.id);
  }, [bedsQuery.data, selectedFacility]);

  const bedBuckets = useMemo(
    () => categorizeBeds(filteredBeds),
    [filteredBeds]
  );

  const bedStats = useMemo(() => summarizeBeds(filteredBeds), [filteredBeds]);

  const featuredAppointment = appointmentsQuery.data?.appointments[0];
  const featuredPatient =
    (featuredAppointment?.patientId &&
      patientLookup.get(featuredAppointment.patientId)) ||
    patientsQuery.data?.patients[0];

  const accommodationOptions =
    facilitiesQuery.data?.facilities.slice(0, 2) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        <button className="flex min-w-[220px] flex-1 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-3">
          <Hospital className="h-5 w-5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">Hospital</p>
            <p className="text-xs text-gray-500">
              Hospital & Emergency services
            </p>
          </div>
        </button>
        <button className="flex min-w-[220px] flex-1 items-center gap-3 rounded-2xl border border-gray-200 bg-white px-6 py-3">
          <Zap className="h-5 w-5" />
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Emergency services
            </p>
            <p className="text-xs text-gray-500">Immediate care coordination</p>
          </div>
        </button>
      </div>

      <EmergencyContactsCard
        primaryContact={primaryContact}
        secondaryContact={secondaryContact}
        onPrimaryChange={setPrimaryContact}
        onSecondaryChange={setSecondaryContact}
        totalContacts={patientContacts.length}
        error={patientsQuery.isError ? 'Unable to load contacts' : undefined}
      />

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Beds tracked"
          value={bedStats.total}
          subtext={`${bedStats.available} ready • ${bedStats.occupied} occupied`}
          icon={Activity}
          accent="emerald"
        />
        <SummaryCard
          label="Patients onboarded"
          value={patientsQuery.data?.total ?? 0}
          subtext="active admissions"
          icon={Users}
          accent="rose"
        />
        <SummaryCard
          label="Network facilities"
          value={facilitiesQuery.data?.total ?? 0}
          subtext="linked to hospital system"
          icon={Building2}
        />
        <SummaryCard
          label="Scheduled visits"
          value={appointmentsQuery.data?.total ?? 0}
          subtext="in queue"
          icon={Activity}
          accent="amber"
        />
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Facility Overview
            </h2>
            <p className="text-sm text-gray-600">
              Filter bed telemetry by facility
            </p>
          </div>
          <select
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 focus:outline-none"
            value={selectedFacilityId}
            onChange={(event) =>
              setSelectedFacilityId(
                event.target.value === 'all'
                  ? 'all'
                  : Number(event.target.value)
              )
            }
          >
            <option value="all">All facilities</option>
            {facilitiesQuery.data?.facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          <BedWardCard
            title="ICU"
            beds={bedBuckets.icu}
            isLoading={bedsQuery.isLoading}
          />
          <BedWardCard
            title="General Ward"
            beds={bedBuckets.general}
            isLoading={bedsQuery.isLoading}
          />
          <BedWardCard
            title="Emergency"
            beds={bedBuckets.emergency}
            isLoading={bedsQuery.isLoading}
          />
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FinanceCard
          appointment={featuredAppointment}
          patient={featuredPatient}
        />
        <HousingCard
          facilities={accommodationOptions}
          isLoading={facilitiesQuery.isLoading}
        />
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">Active Patients</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {patientsQuery.isLoading && (
            <DataState message="Loading patients..." accent="cyan" />
          )}
          {!patientsQuery.isLoading &&
            (patientsQuery.data?.patients.length ?? 0) === 0 && (
              <DataState message="No patients found" />
            )}
          {patientsQuery.data?.patients.map((patient) => (
            <PatientCard key={patient.id} patient={patient} />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">
          Upcoming Appointments
        </h2>
        <div className="mt-4 space-y-3">
          {appointmentsQuery.isLoading && (
            <DataState message="Loading appointments..." accent="cyan" />
          )}
          {!appointmentsQuery.isLoading &&
            (appointmentsQuery.data?.appointments.length ?? 0) === 0 && (
              <DataState message="No appointments scheduled" />
            )}
          {appointmentsQuery.data?.appointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              facilityLookup={facilityLookup}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminHospitalPage;
