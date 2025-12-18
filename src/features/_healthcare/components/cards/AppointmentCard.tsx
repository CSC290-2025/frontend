import React from 'react';
import {
  CalendarClock,
  Hospital,
  Stethoscope,
  User as UserIcon,
} from 'lucide-react';
import type {
  Appointment,
  Facility,
  Doctor,
  Department,
  Patient,
} from '@/features/_healthcare/types';
import { StatusPill } from '@/features/_healthcare/components/common/StatusPill';
import { formatAppointmentTime } from '@/features/_healthcare/utils';

interface AppointmentCardProps {
  appointment: Appointment;
  facilityLookup: Map<number, Facility>;
  doctorLookup?: Map<number, Doctor>;
  departmentLookup?: Map<number, Department>;
  patientLookup?: Map<number, Patient>;
  onEdit?: (appointment: Appointment) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  facilityLookup,
  doctorLookup,
  departmentLookup,
  patientLookup,
  onEdit,
}) => {
  const facilityLabel = appointment.facilityId
    ? (facilityLookup.get(appointment.facilityId)?.name ??
      `Facility #${appointment.facilityId}`)
    : 'Unassigned';

  const doctorLabel = appointment.doctorId
    ? (doctorLookup?.get(appointment.doctorId)?.doctorName ??
      `Doctor #${appointment.doctorId}`)
    : 'Unassigned';

  const doctorSpecialty =
    appointment.doctorId &&
    doctorLookup?.get(appointment.doctorId)?.specialization;
  const facilityDeptId = appointment.facilityId
    ? (facilityLookup.get(appointment.facilityId)?.departmentId ?? null)
    : null;
  const resolvedDeptId = facilityDeptId ?? null;
  const departmentLabel =
    doctorSpecialty ||
    (resolvedDeptId && departmentLookup?.get(resolvedDeptId)
      ? departmentLookup.get(resolvedDeptId)!.name
      : 'Department N/A');

  const patientLabel = appointment.patientId
    ? patientLookup?.get(appointment.patientId)
      ? `Patient #${appointment.patientId}`
      : `Patient #${appointment.patientId}`
    : 'Patient not assigned';

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-base font-semibold text-gray-900">
            Appointment #{appointment.id}
          </p>
          <p className="text-xs text-gray-500">{facilityLabel}</p>
        </div>
        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(appointment)}
              className="rounded-lg border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-700 hover:border-[#01CCFF] hover:text-[#01CCFF]"
            >
              Edit
            </button>
          )}
          <StatusPill status={appointment.status} />
        </div>
      </div>
      <div className="mt-3 grid gap-2 text-xs text-gray-600 md:grid-cols-2">
        <div className="flex items-center gap-2">
          <UserIcon className="h-4 w-4 text-gray-400" />
          <span className="font-semibold text-gray-800">{patientLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <Hospital className="h-4 w-4 text-gray-400" />
          <span>{departmentLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-gray-400" />
          <span>{doctorLabel}</span>
        </div>
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-gray-400" />
          <span>{formatAppointmentTime(appointment.appointmentAt)}</span>
        </div>
      </div>
    </div>
  );
};
