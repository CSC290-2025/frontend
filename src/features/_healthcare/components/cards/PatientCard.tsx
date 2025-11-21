import React from 'react';
import type { Patient } from '@/features/_healthcare/types';

interface PatientCardProps {
  patient: Patient;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient }) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-4">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-semibold text-gray-900">
          Patient #{patient.id}
        </p>
        <p className="text-xs text-gray-500">
          Emergency contact:{' '}
          <span className="font-medium text-gray-700">
            {patient.emergencyContact ?? 'Not provided'}
          </span>
        </p>
      </div>
      <span className="text-xs text-gray-400">
        Created {new Date(patient.createdAt).toLocaleDateString()}
      </span>
    </div>
  </div>
);
