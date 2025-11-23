import React, { useMemo } from 'react';
import { Pill, Syringe, Activity, AlertTriangle } from 'lucide-react';
import {
  useAppointments,
  usePatients,
} from '@/features/_healthcare/hooks/useHealthcareData';
import type { Patient } from '@/features/_healthcare/types';
import { SummaryCard } from '@/features/_healthcare/components/cards/SummaryCard';
import { PrescriptionCard } from '@/features/_healthcare/components/cards/PrescriptionCard';
import { DataState } from '@/features/_healthcare/components/common/DataState';
import { StatusPill } from '@/features/_healthcare/components/common/StatusPill';
import { formatAppointmentTime } from '@/features/_healthcare/utils';

const AdminPharmacyPage: React.FC = () => {
  const appointmentsQuery = useAppointments({
    limit: 20,
    sortBy: 'appointmentAt',
    sortOrder: 'asc',
  });
  const patientsQuery = usePatients({ limit: 30 });

  const patientLookup = useMemo(() => {
    const map = new Map<number, Patient>();
    patientsQuery.data?.patients.forEach((patient) =>
      map.set(patient.id, patient)
    );
    return map;
  }, [patientsQuery.data]);

  const prescriptions = appointmentsQuery.data?.appointments ?? [];
  const urgentPrescriptions = prescriptions.filter(
    (prescription) => prescription.status?.toLowerCase() === 'urgent'
  );

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Prescriptions queued"
          value={prescriptions.length}
          subtext="awaiting preparation"
          icon={Pill}
          accent="violet"
        />
        <SummaryCard
          label="Urgent fills"
          value={urgentPrescriptions.length}
          subtext="priority within 2hrs"
          icon={AlertTriangle}
          accent="rose"
        />
        <SummaryCard
          label="Vaccinations"
          value="128"
          subtext="scheduled this month"
          icon={Syringe}
          accent="amber"
        />
        <SummaryCard
          label="Medication stock"
          value="87%"
          subtext="inventory health"
          icon={Activity}
          accent="emerald"
        />
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Prescription Queue
          </h2>
          <span className="text-xs text-gray-400">
            {prescriptions.length} entries
          </span>
        </div>
        <div className="mt-4 space-y-3">
          {appointmentsQuery.isLoading && (
            <DataState message="Loading prescriptions..." accent="cyan" />
          )}
          {!appointmentsQuery.isLoading && prescriptions.length === 0 && (
            <DataState message="No prescriptions pending" />
          )}
          {prescriptions.map((appointment) => (
            <PrescriptionCard
              key={appointment.id}
              appointment={appointment}
              patient={patientLookup.get(appointment.patientId ?? 0)}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-bold text-gray-900">Pickup Schedule</h2>
        <div className="mt-4 space-y-3">
          {prescriptions.slice(0, 5).map((appointment) => (
            <div
              key={`pickup-${appointment.id}`}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-700"
            >
              <div>
                <p className="font-semibold">
                  Order #{appointment.id} • Patient #{appointment.patientId}
                </p>
                <p className="text-xs text-gray-500">
                  {formatAppointmentTime(appointment.appointmentAt)}
                </p>
              </div>
              <StatusPill status={appointment.status} />
            </div>
          ))}
          {prescriptions.length === 0 && (
            <DataState message="No pickups scheduled" compact />
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminPharmacyPage;
