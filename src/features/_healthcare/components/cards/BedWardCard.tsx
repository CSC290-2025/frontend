import React from 'react';
import type { Bed } from '@/features/_healthcare/types';
import { DataState } from '@/features/_healthcare/components/common/DataState';
import { makeBedLabel, normalizeStatus } from '@/features/_healthcare/utils';

interface BedWardCardProps {
  title: string;
  beds: Bed[];
  isLoading?: boolean;
}

export const BedWardCard: React.FC<BedWardCardProps> = ({
  title,
  beds,
  isLoading,
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5">
    <h3 className="mb-4 text-base font-bold text-gray-900">{title}</h3>
    {isLoading && <DataState message="Syncing beds..." compact />}
    {!isLoading && beds.length === 0 && (
      <DataState
        message="No beds mapped"
        description="Update bed metadata to classify them."
        compact
      />
    )}
    <div className="max-h-72 space-y-3 overflow-y-auto pr-1">
      {beds.map((bed) => (
        <BedStatus key={bed.id} bed={bed} />
      ))}
    </div>
  </div>
);

const BedStatus: React.FC<{ bed: Bed }> = ({ bed }) => {
  const status = normalizeStatus(bed.status);
  const colors: Record<string, string> = {
    available: 'bg-green-500',
    occupied: 'bg-red-500',
    maintenance: 'bg-orange-500',
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
      <span className="text-sm text-gray-700">{makeBedLabel(bed)}</span>
      <span
        className={`h-3 w-3 rounded-full ${colors[status] ?? 'bg-gray-400'}`}
      ></span>
    </div>
  );
};
