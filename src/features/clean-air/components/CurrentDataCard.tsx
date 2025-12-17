import { useParams } from '@/router';
import useDistrictDetailQuery from '@/features/clean-air/hooks/useDistrictDetail';

export default function CurrentDataCard() {
  const { district } = useParams('/clean-air/district-detail/:district');
  const { data, isLoading, error } = useDistrictDetailQuery(district);
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-300 bg-white p-6 text-gray-900 shadow-md">
        <div className="text-center">Loading current data...</div>
      </div>
    );
  }

  if (error || !data?.currentData) {
    return (
      <div className="rounded-xl border border-gray-300 bg-white p-6 text-gray-900 shadow-md">
        <div className="text-center text-red-600">
          {error?.message || 'No current data available'}
        </div>
      </div>
    );
  }

  const currentData = data.currentData;
  const pollutants = [
    {
      name: 'PM2.5',
      value: currentData.pm25 || '—',
      unit: 'µg/m³',
    },
    {
      name: 'PM10',
      value: currentData.pm10 || '—',
      unit: 'µg/m³',
    },
    {
      name: 'O3',
      value: currentData.o3 || '—',
      unit: 'µg/m³',
    },
    {
      name: 'CO',
      value: currentData.co || '—',
      unit: 'µg/m³',
    },
    {
      name: 'NO2',
      value: currentData.no2 || '—',
      unit: 'µg/m³',
    },
    {
      name: 'SO3',
      value: currentData.so2 || '—',
      unit: 'µg/m³',
    },
  ];

  return (
    <div className="rounded-xl border border-black bg-white p-6 text-gray-900 shadow-md">
      <div className="mb-4">
        <h2 className="text-base font-semibold text-gray-800">
          Major Air Pollutants
        </h2>
      </div>
      <div className="grid grid-cols-6 gap-2 text-center">
        {pollutants.map((pollutant, index) => (
          <div key={index} className="flex flex-col items-center p-2">
            <p className="text-2xl font-bold text-gray-900">
              {pollutant.value}
            </p>
            <p className="mt-1 text-sm text-gray-800">{pollutant.unit}</p>
            <p className="mt-1 text-base font-medium text-gray-800 uppercase">
              {pollutant.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
