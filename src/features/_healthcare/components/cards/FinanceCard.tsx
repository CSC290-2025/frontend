import React from 'react';
import type { Appointment, Patient } from '@/features/_healthcare/types';
import { currencyFormatter } from '@/features/_healthcare/utils';
import { CheckCircle } from 'lucide-react';

interface FinanceCardProps {
  appointment?: Appointment;
  patient?: Patient;
}

export const FinanceCard: React.FC<FinanceCardProps> = ({
  appointment,
  patient,
}) => {
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
      <div className="mb-4 space-y-3 text-sm text-gray-700">
        <InfoRow label="Patient" value={`#${appointment?.patientId ?? '—'}`} />
        <InfoRow
          label="Insurance"
          value={insuranceStatus}
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
        />
        <InfoRow label="Pre-auth" value={appointmentStatus} />
      </div>
      <div className="mb-4 text-lg font-bold text-gray-900">
        Est. Cost : {estimatedCost}
      </div>
      <button className="w-full rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 sm:w-auto">
        Process Billing
      </button>
    </div>
  );
};

const InfoRow: React.FC<{
  label: string;
  value: string;
  icon?: React.ReactNode;
}> = ({ label, value, icon }) => (
  <div className="flex items-center gap-2">
    <span className="font-semibold">{label}</span>
    <span className="text-gray-400">:</span>
    {icon}
    <span>{value}</span>
  </div>
);
