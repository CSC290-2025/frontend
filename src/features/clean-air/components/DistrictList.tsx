import React, { useMemo } from 'react';
import DistrictItem from './DistrictItem';
import { useDistrictsQuery } from '../hooks/useDistricts';
import type { District } from '@/types/district';

type Props = {
  searchTerm?: string;
};

export default function DistrictList({ searchTerm = '' }: Props) {
  const {
    data: districts = [],
    isLoading,
    isError,
    error,
    refetch,
    isFetched,
  } = useDistrictsQuery();

  const filtered = useMemo(() => {
    if (!searchTerm) return districts;
    const q = searchTerm.toLowerCase();
    return districts.filter((d: District) =>
      (d.district ?? (d as any).name ?? '').toString().toLowerCase().includes(q)
    );
  }, [searchTerm, districts]);

  if (isLoading)
    return <div className="p-8 text-center">Loading districts...</div>;
  if (isError)
    return (
      <div className="p-8 text-center">
        Error: {(error as Error).message}
        <div className="mt-2">
          <button
            onClick={() => refetch()}
            className="rounded bg-blue-500 px-2 py-1 text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );

  if (isFetched && filtered.length === 0)
    return (
      <div className="py-10 text-center text-gray-700">
        Area/Zone not found{searchTerm ? ` for "${searchTerm}"` : '.'}
      </div>
    );

  return (
    <div className="space-y-4">
      {filtered.map((item: District) => (
        <DistrictItem
          key={(item.district ?? (item as any).name) as string}
          district={item.district ?? (item as any).name}
          aqi={item.aqi}
          category={item.category}
          pm25={item.pm25}
          measured_at={item.measured_at}
        />
      ))}
    </div>
  );
}
