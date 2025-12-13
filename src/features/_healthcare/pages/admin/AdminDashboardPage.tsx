import React, { useMemo } from 'react';
import {
  Activity,
  Building2,
  Users,
  CalendarClock,
  PhoneCall,
  ShieldAlert,
  Syringe,
} from 'lucide-react';
import {
  useAppointments,
  useBeds,
  useFacilities,
  usePatients,
} from '@/features/_healthcare/hooks/useHealthcareData';
import type { Facility } from '@/features/_healthcare/types';
import { SummaryCard } from '@/features/_healthcare/components/cards/SummaryCard';
import { QuickActionCard } from '@/features/_healthcare/components/cards/QuickActionCard';
import { DataState } from '@/features/_healthcare/components/common/DataState';
import { AppointmentCard } from '@/features/_healthcare/components/cards/AppointmentCard';
import { summarizeBeds } from '@/features/_healthcare/utils';

const AdminDashboardPage: React.FC = () => {
  const bedsQuery = useBeds({ limit: 40 });
  const patientsQuery = usePatients({ limit: 16 });
  const appointmentsQuery = useAppointments({
    limit: 12,
    sortBy: 'appointmentAt',
    sortOrder: 'asc',
  });
  const facilitiesQuery = useFacilities({ limit: 12 });

  const bedStats = useMemo(
    () => summarizeBeds(bedsQuery.data?.beds ?? []),
    [bedsQuery.data]
  );
  const facilitiesLookup = useMemo(() => {
    const map = new Map<number, Facility>();
    facilitiesQuery.data?.facilities.forEach((facility) =>
      map.set(facility.id, facility)
    );
    return map;
  }, [facilitiesQuery.data]);

  const quickActions = [
    {
      icon: PhoneCall,
      title: 'Emergency Hotline',
      description: '+1 (555) 100-2100',
    },
    {
      icon: ShieldAlert,
      title: 'Incident Report',
      description: 'Log safety or triage alerts',
    },
    {
      icon: Syringe,
      title: 'Vaccination Drive',
      description: '112 participants registered',
    },
  ];

  const upcomingAppointments =
    appointmentsQuery.data?.appointments.slice(0, 4) ?? [];

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Tracked Beds"
          value={bedStats.total}
          subtext={`${bedStats.available} available`}
          icon={Activity}
          accent="emerald"
        />
        <SummaryCard
          label="Registered Patients"
          value={patientsQuery.data?.total ?? 0}
          subtext="actively monitored"
          icon={Users}
          accent="rose"
        />
        <SummaryCard
          label="Facilities Linked"
          value={facilitiesQuery.data?.total ?? 0}
          subtext="city wide network"
          icon={Building2}
        />
        <SummaryCard
          label="Upcoming Visits"
          value={appointmentsQuery.data?.total ?? 0}
          subtext="scheduled this week"
          icon={CalendarClock}
          accent="amber"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {quickActions.map((action) => (
          <QuickActionCard key={action.title} {...action} />
        ))}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Upcoming Appointments
          </h2>
          <span className="text-xs text-gray-400">
            {appointmentsQuery.isLoading
              ? 'Syncing...'
              : `${upcomingAppointments.length} shown`}
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {appointmentsQuery.isLoading && (
            <DataState message="Loading appointments..." accent="cyan" />
          )}
          {!appointmentsQuery.isLoading &&
            upcomingAppointments.length === 0 && (
              <DataState
                message="No upcoming appointments"
                description="Create a booking to see it here."
              />
            )}
          {upcomingAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              facilityLookup={facilitiesLookup}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;
