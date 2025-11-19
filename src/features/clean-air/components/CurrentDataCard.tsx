import { useParams } from '@/router';
import useDistrictDetailQuery from '@/features/clean-air/hooks/useDistrictDetail';

export default function CurrentDataCard() {
  const { district } = useParams('/clean-air/district-detail/:district');
  const { data, isLoading, error } = useDistrictDetailQuery(district);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
        <div className="text-center">Loading current data...</div>
      </div>
    );
  }

  if (error || !data?.currentData) {
    return (
      <div className="rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
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
      name: 'CO',
      value: currentData.co || '—',
      unit: 'ppm',
    },
    {
      name: 'NO2',
      value: currentData.no2 || '—',
      unit: 'ppb',
    },
    {
      name: 'SO2',
      value: currentData.so2 || '—',
      unit: 'ppb',
    },
    {
      name: 'O3',
      value: currentData.o3 || '—',
      unit: 'ppb',
    },
  ];

  return (
    <div className="rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Major Air Pollutants</h2>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {pollutants.map((pollutant, index) => (
          <div
            key={index}
            className="cursor-pointer rounded-xl border border-gray-300 bg-gray-100 p-4 text-center shadow-md transition-colors hover:bg-gray-200"
          >
            <p className="text-xl font-bold">{pollutant.value}</p>
            <p className="mt-1 text-xs text-gray-600">{pollutant.unit}</p>
            <p className="mt-1 text-sm font-medium uppercase">
              {pollutant.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
