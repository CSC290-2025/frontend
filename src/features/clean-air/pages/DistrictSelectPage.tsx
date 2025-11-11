// Path: frontend/src/features/clean-air/pages/DistrictSelectPage.tsx

import { useState, useMemo } from 'react';
import DistrictItem from '@/features/clean-air/components/DistrictItem';
import DistrictSearch from '@/features/clean-air/components/DistrictSearch';
import { useDistrictsQuery } from '../hooks/useDistricts';

// สร้าง Inline Mock Data สำหรับ Districts
// const INLINE_DISTRICT_MOCK: any[] = [
//   {
//     district: 'Sathon',
//     aqi: 55,
//     category: 'Moderate',
//     pm25: 15,
//     measured_at: '2025-10-25 10:00:00',
//   },
//   {
//     district: 'Din Daeng',
//     aqi: 155,
//     category: 'Unhealthy',
//     pm25: 65,
//     measured_at: '2025-10-25 10:00:00',
//   },
//   {
//     district: 'Bangna',
//     aqi: 25,
//     category: 'Good',
//     pm25: 5,
//     measured_at: '2025-10-25 10:00:00',
//   },
// ];

export default function DistrictSelectPage() {
  console.debug('DistrictSelectPage mounted');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: districts = [],
    isLoading,
    isError,
    error,
  } = useDistrictsQuery();

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };
  const filteredDistricts = useMemo(() => {
    if (!searchTerm) return districts;
    const q = searchTerm.toLowerCase();
    return districts.filter((item: any) => {
      const name = (item.district ?? item.name ?? '').toString().toLowerCase();
      return name.includes(q);
    });
  }, [searchTerm, districts]);

  if (isLoading)
    return <div className="p-8 text-center">Loading districts...</div>;
  if (isError)
    return (
      <div className="p-8 text-center">Error: {(error as Error).message}</div>
    );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="w-full border-b border-gray-700 bg-gray-600 py-4 text-center shadow-md">
        <h1 className="text-xl font-bold text-white uppercase">
          CLEAN AIR MONITOR
        </h1>
      </header>
      <div className="mx-auto max-w-xl space-y-4 p-4 pt-8">
        <DistrictSearch onSearch={handleSearch} />
        <div className="space-y-4">
          {filteredDistricts.map((item: any) => (
            <DistrictItem
              key={item.district}
              district={item.district}
              aqi={item.aqi}
              category={item.category}
              pm25={item.pm25}
              measured_at={item.measured_at}
            />
          ))}
          {filteredDistricts.length === 0 && (
            <div className="py-10 text-center text-gray-700">
              Area/Zone not found. {searchTerm}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
