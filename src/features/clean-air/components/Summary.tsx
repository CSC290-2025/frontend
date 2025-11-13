export function Summary() {
  const summaryData = [
    { label: 'Average AQI (7 days)', value: 105, unit: 'AQI' },
    { label: 'Highest AQI (27 Aug 2025)', value: 162, unit: 'AQI' },
    { label: 'Change from yesterday', value: '+15', unit: '' },
  ];

  return (
    <div className="h-full rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
      <h2 className="mb-4 text-lg font-semibold">Week Summary</h2>
      <div className="grid grid-cols-3 gap-4">
        {summaryData.map((item, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-300 bg-gray-100 p-4 text-center"
          >
            <p className="text-3xl font-bold">{item.value}</p>
            <p className="text-sm font-medium text-gray-700">{item.unit}</p>
            <p className="mt-1 text-xs leading-tight text-gray-500">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
