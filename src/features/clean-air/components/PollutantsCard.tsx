interface PollutantData {
  name: string;
  value: number;
  unit: string;
}

const mockPollutants: PollutantData[] = [
  { name: 'PM2.5', value: 56, unit: 'µg/m³' },
  { name: 'PM10', value: 56, unit: 'µg/m³' },
  { name: 'O3', value: 56, unit: 'µg/m³' },
  { name: 'CO', value: 56, unit: 'µg/m³' },
  { name: 'NO2', value: 56, unit: 'µg/m³' },
  { name: 'SO2', value: 56, unit: 'µg/m³' },
];

export function PollutantsCard() {
  return (
    <div className="rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
      <h2 className="mb-6 text-xl font-semibold">Major Air Pollutants</h2>
      <div className="grid grid-cols-3 gap-4">
        {mockPollutants.map((pollutant, index) => (
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
