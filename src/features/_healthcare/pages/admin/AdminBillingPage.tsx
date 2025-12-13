import React, { useMemo } from 'react';
import { Receipt } from 'lucide-react';
import {
  useAppointments,
  useFacilities,
} from '@/features/_healthcare/hooks/useHealthcareData';
import type { Facility } from '@/features/_healthcare/types';
import { DataState } from '@/features/_healthcare/components/common/DataState';
import { StatusPill } from '@/features/_healthcare/components/common/StatusPill';
import { formatAppointmentTime } from '@/features/_healthcare/utils';

const AdminBillingPage: React.FC = () => {
  const appointmentsQuery = useAppointments({
    limit: 100,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const facilitiesQuery = useFacilities({ limit: 50 });

  const facilityLookup = useMemo(() => {
    const map = new Map<number, Facility>();
    facilitiesQuery.data?.facilities.forEach((facility) =>
      map.set(facility.id, facility)
    );
    return map;
  }, [facilitiesQuery.data]);

  const invoices = appointmentsQuery.data?.appointments ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Billing History</h2>
            <p className="text-sm text-gray-600">
              Charges for appointments and medication orders
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Receipt className="h-4 w-4" />
            {invoices.length} records
          </div>
        </div>

        <div className="mt-4 grid gap-6 lg:grid-cols-2">
          <BillingList
            title="Appointment billing"
            invoices={invoices}
            facilityLookup={facilityLookup}
            isLoading={appointmentsQuery.isLoading}
          />
          <BillingList
            title="Medication billing"
            invoices={invoices}
            facilityLookup={facilityLookup}
            isLoading={appointmentsQuery.isLoading}
          />
        </div>
      </section>
    </div>
  );
};

const BillingList: React.FC<{
  title: string;
  invoices: {
    id: number;
    appointmentAt: string | null;
    facilityId: number | null;
    type: string | null;
    status: string | null;
  }[];
  facilityLookup: Map<number, Facility>;
  isLoading: boolean;
}> = ({ title, invoices, facilityLookup, isLoading }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <span className="text-xs text-gray-500">{invoices.length} entries</span>
    </div>
    {isLoading && <DataState message="Loading billing data..." accent="cyan" />}
    {!isLoading && invoices.length === 0 && (
      <DataState message="No billing records found" compact />
    )}
    <div className="mt-3 max-h-[320px] space-y-3 overflow-y-auto pr-1">
      {invoices.map((invoice) => (
        <div
          key={`${title}-${invoice.id}`}
          className="flex items-start justify-between gap-4 rounded-lg border border-gray-200 bg-white px-3 py-3"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-900">
              #{invoice.id} • {invoice.type ?? 'Appointment'}
            </p>
            <p className="text-xs text-gray-600">
              {facilityLookup.get(invoice.facilityId ?? -1)?.name ??
                `Facility #${invoice.facilityId ?? '—'}`}
            </p>
            <p className="text-xs text-gray-500">
              {formatAppointmentTime(invoice.appointmentAt)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <StatusPill status={invoice.status} />
            <span className="text-[11px] tracking-wide text-gray-500 uppercase">
              {invoice.status ?? 'Pending'}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default AdminBillingPage;
