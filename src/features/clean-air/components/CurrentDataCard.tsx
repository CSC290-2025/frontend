import { useParams } from '@/router';
import useDistrictDetailQuery from '@/features/clean-air/hooks/useDistrictDetail';

export default function CurrentDataCard() {
  const { district } = useParams('/clean-air/district-detail/:district');
  const { data, isLoading, error } = useDistrictDetailQuery(district);
  if (isLoading || error || !data?.currentData) {
    return (
      <div className="flex min-h-[150px] items-center justify-center rounded-xl border border-black bg-white p-6 shadow-md">
        <p>
          {isLoading
            ? 'Loading current data...'
            : error?.message || 'No data available'}
        </p>
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
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800">
          Major Air Pollutants
        </h2>
      </div>
      <div className="grid grid-cols-3 gap-6 text-center lg:grid-cols-6 lg:gap-5">
        {pollutants.map((pollutant, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center"
          >
            <p className="text-3xl leading-tight font-medium text-gray-900">
              {pollutant.value}
            </p>
            <p className="mt-1 text-[12px] font-normal text-gray-400">
              {pollutant.unit}
            </p>
            <p className="mt-0.5 text-sm font-medium tracking-wide text-gray-600 uppercase">
              {pollutant.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
