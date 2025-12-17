import React from 'react';
import { CreditCard } from 'lucide-react';
import {
  useAppointments,
  usePrescriptions,
} from '@/features/_healthcare/hooks/useHealthcareData';
import { StatusPill } from '@/features/_healthcare/components/common/StatusPill';
import { DataState } from '@/features/_healthcare/components/common/DataState';
import { formatAppointmentTime } from '@/features/_healthcare/utils';

const UserBillingPage: React.FC = () => {
  const appointmentsQuery = useAppointments({
    limit: 100,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  const prescriptionsQuery = usePrescriptions({
    limit: 100,
    sortOrder: 'desc',
  });

  const appointments = appointmentsQuery.data?.appointments ?? [];
  const prescriptions = prescriptionsQuery.data?.prescriptions ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Payments</h2>
          <CreditCard className="h-5 w-5 text-[#01CCFF]" />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">Default card</p>
            <p className="mt-1 text-xs text-gray-600">**** 4242 • Exp 08/28</p>
            <button className="mt-3 rounded-lg bg-[#01CCFF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0091B5]">
              Add / Update card
            </button>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">
              Billing preferences
            </p>
            <p className="mt-1 text-xs text-gray-600">
              Receive reminders before due date.
            </p>
            <button className="mt-3 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:border-[#0091B5]">
              Manage reminders
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">Billing history</h2>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <BillingList title="Appointments" items={appointments} />
          <BillingList title="Medication orders" items={prescriptions} />
        </div>
      </section>
    </div>
  );
};

type BillingItem = {
  id: number;
  appointmentAt?: string | null;
  createdAt: string;
  status?: string | null;
};

const BillingList: React.FC<{ title: string; items: BillingItem[] }> = ({
  title,
  items,
}) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      <span className="text-xs text-gray-500">{items.length} records</span>
    </div>
    <div className="mt-3 max-h-60 space-y-3 overflow-y-auto pr-1">
      {items.length === 0 && <DataState message="No records" compact />}
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900">#{item.id}</p>
            <p className="text-xs text-gray-600">
              {formatAppointmentTime(item.appointmentAt ?? item.createdAt)}
            </p>
          </div>
          <StatusPill status={item.status ?? 'Pending'} />
        </div>
      ))}
    </div>
  </div>
);

export default UserBillingPage;
