import React from 'react';
import { Phone } from 'lucide-react';
import { useAppointments } from '@/features/_healthcare/hooks/useHealthcareData';
import { StatusPill } from '@/features/_healthcare/components/common/StatusPill';
import { DataState } from '@/features/_healthcare/components/common/DataState';
import { formatAppointmentTime } from '@/features/_healthcare/utils';

interface Props {
  emergencyContact: string;
  onContactChange: (val: string) => void;
}

const UserOverviewPage: React.FC<Props> = ({
  emergencyContact,
  onContactChange,
}) => {
  const appointmentsQuery = useAppointments({
    limit: 10,
    sortBy: 'appointmentAt',
    sortOrder: 'asc',
  });
  const upcomingAppointments = appointmentsQuery.data?.appointments ?? [];

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">Emergency Contact</h2>
        <p className="text-sm text-gray-600">
          Add a trusted contact for emergencies.
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <input
              className="flex-1 border-0 text-sm text-gray-800 focus:outline-none"
              placeholder="Name • Phone"
              value={emergencyContact}
              onChange={(e) => onContactChange(e.target.value)}
            />
          </div>
          <button className="rounded-lg bg-[#01CCFF] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0091B5]">
            Save contact
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">Next appointments</h2>
        <div className="mt-4 space-y-3">
          {upcomingAppointments.length === 0 && (
            <DataState message="No appointments yet" accent="cyan" />
          )}
          {upcomingAppointments.map((appt) => (
            <div
              key={appt.id}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  #{appt.id} • {appt.type ?? 'General'}
                </p>
                <p className="text-xs text-gray-600">
                  {formatAppointmentTime(appt.appointmentAt)}
                </p>
              </div>
              <StatusPill status={appt.status} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default UserOverviewPage;
