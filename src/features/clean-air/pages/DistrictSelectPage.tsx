// Path: frontend/src/features/clean-air/pages/DistrictSelectPage.tsx

import { useState, useMemo } from 'react';
import DistrictItem from '@/features/clean-air/components/DistrictItem';
import DistrictSearch from '@/features/clean-air/components/DistrictSearch';

// สร้าง Inline Mock Data สำหรับ Districts
const INLINE_DISTRICT_MOCK: any[] = [
  {
    district: 'Sathon',
    aqi: 55,
    category: 'Moderate',
    pm25: 15,
    measured_at: '2025-10-25 10:00:00',
  },
  {
    district: 'Din Daeng',
    aqi: 155,
    category: 'Unhealthy',
    pm25: 65,
    measured_at: '2025-10-25 10:00:00',
  },
  {
    district: 'Bangna',
    aqi: 25,
    category: 'Good',
    pm25: 5,
    measured_at: '2025-10-25 10:00:00',
  },
];

export default function DistrictSelectPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const filteredDistricts = useMemo(() => {
    const districts = INLINE_DISTRICT_MOCK;

    if (!searchTerm) {
      return districts;
    }

    const lowercasedTerm = searchTerm.toLowerCase();

    return districts.filter((item) =>
      item.district.toLowerCase().includes(lowercasedTerm)
    );
  }, [searchTerm]);

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
          {filteredDistricts.map((item) => (
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
