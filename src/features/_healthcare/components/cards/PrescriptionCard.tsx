import React from 'react';
import type { Appointment, Patient } from '@/features/_healthcare/types';
import { Pill } from 'lucide-react';
import { formatAppointmentTime } from '@/features/_healthcare/utils';

interface PrescriptionCardProps {
  appointment: Appointment;
  patient?: Patient;
}

export const PrescriptionCard: React.FC<PrescriptionCardProps> = ({
  appointment,
  patient,
}) => (
  <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
    <span className="rounded-xl bg-purple-50 p-3">
      <Pill className="h-4 w-4 text-purple-600" />
    </span>
    <div className="flex-1">
      <p className="text-sm font-semibold text-gray-900">
        {appointment.type ?? 'General Prescription'}
      </p>
      <p className="text-xs text-gray-500">
        Patient #{appointment.patientId}{' '}
        {patient?.emergencyContact ? `• ${patient.emergencyContact}` : ''}
      </p>
    </div>
    <span className="text-xs text-gray-400">
      {formatAppointmentTime(appointment.appointmentAt)}
    </span>
  </div>
);
