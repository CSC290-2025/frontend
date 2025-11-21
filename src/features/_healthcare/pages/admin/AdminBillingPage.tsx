import React, { useMemo } from 'react';
import type { Facility } from '@/features/_healthcare/types';
import { DollarSign, CreditCard, Activity, Building2 } from 'lucide-react';
import {
  useAppointments,
  useFacilities,
} from '@/features/_healthcare/hooks/useHealthcareData';
import { SummaryCard } from '@/features/_healthcare/components/cards/SummaryCard';
import { AppointmentCard } from '@/features/_healthcare/components/cards/AppointmentCard';
import { DataState } from '@/features/_healthcare/components/common/DataState';
import { currencyFormatter } from '@/features/_healthcare/utils';

const AdminBillingPage: React.FC = () => {
  const appointmentsQuery = useAppointments({
    limit: 25,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const facilitiesQuery = useFacilities({ limit: 20 });

  const facilityLookup = useMemo(() => {
    const map = new Map<number, Facility>();
    facilitiesQuery.data?.facilities.forEach((facility) =>
      map.set(facility.id, facility)
    );
    return map;
  }, [facilitiesQuery.data]);

  const totalCharges = useMemo(() => {
    const base = appointmentsQuery.data?.appointments.length ?? 0;
    return currencyFormatter.format(base * 420);
  }, [appointmentsQuery.data]);

  const settled =
    (appointmentsQuery.data?.appointments.filter(
      (appointment) =>
        appointment.status?.toLowerCase() === 'completed' ||
        appointment.status?.toLowerCase() === 'paid'
    ).length ?? 0) * 420;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Open invoices"
          value={appointmentsQuery.data?.appointments.length ?? 0}
          subtext="awaiting payment"
          icon={CreditCard}
          accent="rose"
        />
        <SummaryCard
          label="Settled today"
          value={currencyFormatter.format(settled)}
          subtext="processed payments"
          icon={DollarSign}
          accent="emerald"
        />
        <SummaryCard
          label="Total billed"
          value={totalCharges}
          subtext="current period"
          icon={Activity}
        />
        <SummaryCard
          label="Facilities billed"
          value={facilitiesQuery.data?.total ?? 0}
          subtext="active providers"
          icon={Building2}
        />
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Billing Queue</h2>
          <span className="text-xs text-gray-400">
            {appointmentsQuery.isLoading
              ? 'Calculating...'
              : `${appointmentsQuery.data?.appointments.length ?? 0} items`}
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {appointmentsQuery.isLoading && (
            <DataState message="Loading billing data..." accent="cyan" />
          )}
          {!appointmentsQuery.isLoading &&
            (appointmentsQuery.data?.appointments.length ?? 0) === 0 && (
              <DataState message="No invoices found" />
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

export default AdminBillingPage;
