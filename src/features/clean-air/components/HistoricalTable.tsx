interface HistoricalRecord {
  date: string;
  aqi: number;
  pm25: number;
  pm10: number;
  o3: number;
  co: number;
  no2: number;
  so2: number;
  status: string;
}

const mockRecords: HistoricalRecord[] = [
  {
    date: '29 Aug 2025',
    aqi: 162,
    pm25: 162,
    pm10: 56,
    o3: 56,
    co: 56,
    no2: 56,
    so2: 56,
    status: 'Unhealthy',
  },
  {
    date: '28 Aug 2025',
    aqi: 120,
    pm25: 120,
    pm10: 40,
    o3: 40,
    co: 40,
    no2: 40,
    so2: 40,
    status: 'Unhealthy',
  },
  {
    date: '27 Aug 2025',
    aqi: 162,
    pm25: 162,
    pm10: 55,
    o3: 55,
    co: 55,
    no2: 55,
    so2: 55,
    status: 'Unhealthy',
  },
  {
    date: '26 Aug 2025',
    aqi: 98,
    pm25: 98,
    pm10: 30,
    o3: 30,
    co: 30,
    no2: 30,
    so2: 30,
    status: 'Moderate',
  },
];

const getStatusBadge = (status: string) => {
  const baseStyle = 'px-2 py-0.5 rounded-full text-xs font-medium';
  switch (status) {
    case 'Unhealthy':
      return `${baseStyle} bg-red-600 text-white`;
    case 'Moderate':
      return `${baseStyle} bg-yellow-500 text-gray-900`;
    case 'Good':
      return `${baseStyle} bg-green-500 text-white`;
    default:
      return `${baseStyle} bg-gray-400 text-gray-900`;
  }
};

export function HistoricalTable() {
  const headers = [
    'Date',
    'AQI',
    'PM2.5',
    'PM10',
    'O3',
    'CO',
    'NO2',
    'SO2',
    'Status',
  ];

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
      <h2 className="mb-4 text-lg font-semibold">Historical Records</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="border-b border-gray-300 bg-gray-100">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-700 uppercase"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {mockRecords.map((record, index) => (
              <tr key={index} className="transition-colors hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                  {record.date}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  {record.aqi}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  {record.pm25}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  {record.pm10}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  {record.o3}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  {record.co}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  {record.no2}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  {record.so2}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">
                  <span className={getStatusBadge(record.status)}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
