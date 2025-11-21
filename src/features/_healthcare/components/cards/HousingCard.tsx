import React from 'react';
import type { Facility } from '@/features/_healthcare/types';
import { DataState } from '@/features/_healthcare/components/common/DataState';
import { Home } from 'lucide-react';

interface HousingCardProps {
  facilities: Facility[];
  isLoading?: boolean;
}

export const HousingCard: React.FC<HousingCardProps> = ({
  facilities,
  isLoading,
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-6">
    <h3 className="mb-4 text-lg font-bold text-gray-900">House Integration</h3>
    <div className="mb-4">
      <h4 className="mb-3 text-sm font-semibold text-gray-700">
        Family Accommodation
      </h4>
      {isLoading && <DataState message="Loading facilities..." compact />}
      {!isLoading && facilities.length === 0 && (
        <DataState
          message="No facilities available"
          description="Register housing partners to show options."
          compact
        />
      )}
      <div className="space-y-2">
        {facilities.map((facility) => (
          <div
            key={facility.id}
            className="flex items-center justify-between text-sm text-gray-600"
          >
            <span>
              <Home className="mr-2 inline h-4 w-4 text-gray-400" />
              {facility.name}
            </span>
            <span className="font-semibold text-gray-900">
              {facility.phone ?? facility.facilityType ?? 'Contact TBD'}
            </span>
          </div>
        ))}
      </div>
    </div>
    <div className="mb-4 text-sm text-gray-600">
      <span className="mr-1 text-red-500">↑</span>
      Walking Distance:{' '}
      {facilities[0]?.addressId
        ? `${facilities[0].addressId} blocks`
        : '2 blocks'}
    </div>
    <button className="w-full rounded-xl bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 sm:w-auto">
      Book Room
    </button>
  </div>
);
