import React from 'react';
import type { Appointment, Facility } from '@/features/_healthcare/types';
import { StatusPill } from '@/features/_healthcare/components/common/StatusPill';
import { formatAppointmentTime } from '@/features/_healthcare/utils';

interface AppointmentCardProps {
  appointment: Appointment;
  facilityLookup: Map<number, Facility>;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  facilityLookup,
}) => {
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
        <StatusPill status={appointment.status} />
      </div>
      <div className="mt-2 text-xs text-gray-500">
        {formatAppointmentTime(appointment.appointmentAt)}
      </div>
    </div>
  );
};
