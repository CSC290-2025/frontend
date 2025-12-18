import useHistoryQuery from '@/features/clean-air/hooks/useHistory';
import { useParams } from '@/router';

const getStatusBadge = (category: string) => {
  const baseStyle = 'px-2 py-0.5 rounded-full text-xs font-medium';
  switch (category.toUpperCase()) {
    case 'GOOD':
    case 'HEALTHY':
      return `${baseStyle} bg-teal-200 text-black`;
    case 'MODERATE':
      return `${baseStyle} bg-lime-200 text-black`;
    case 'UNHEALTHY_FOR_SENSITIVE':
    case 'UNHEALTHY_FOR_SENSITIVE_GROUPS':
    case 'USG':
      return `${baseStyle} bg-yellow-200 text-black`;
    case 'UNHEALTHY':
    case 'BAD':
      return `${baseStyle} bg-orange-200 text-black`;
    case 'VERY_UNHEALTHY':
    case 'HAZARDOUS':
      return `${baseStyle} bg-red-200 text-black`;
    default:
      return `${baseStyle} bg-gray-400 text-black`;
  }
};

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  } catch {
    return dateString;
  }
};

const formatCategoryLabel = (category: string) => {
  return category.replace(/_/g, ' ');
};

const getLatestRecordPerDate = (records: any[]) => {
  if (!records) return [];

  const recordsByDate = new Map();

  records.forEach((record) => {
    const dateKey = formatDate(record.measured_at);

    const currentRecord = recordsByDate.get(dateKey);

    if (
      !currentRecord ||
      new Date(record.measured_at) > new Date(currentRecord.measured_at)
    ) {
      recordsByDate.set(dateKey, record);
    }
  });

  const result = Array.from(recordsByDate.values()).sort(
    (a, b) =>
      new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()
  );

  return result;
};
export default function HistoricalTable() {
  const { district } = useParams('/clean-air/district-detail/:district');
  const { data: history, isLoading, error } = useHistoryQuery(district);

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

  if (isLoading) {
    return (
      <div className="overflow-x-auto rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
        <h2 className="mb-4 text-lg font-semibold">Historical Records</h2>
        <div className="animate-pulse">
          <div className="mb-4 h-10 rounded bg-gray-200"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="mb-2 h-8 rounded bg-gray-100"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="overflow-x-auto rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
        <h2 className="mb-4 text-lg font-semibold">Historical Records</h2>
        <div className="text-center text-red-500">
          <p>Error loading historical data</p>
        </div>
      </div>
    );
  }

  if (!history || !history.history || history.history.length === 0) {
    return (
      <div className="overflow-x-auto rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
        <h2 className="mb-4 text-lg font-semibold">Historical Records</h2>
        <div className="text-center text-gray-500">
          <p>No historical data available</p>
        </div>
      </div>
    );
  }

  const uniqueRecords = getLatestRecordPerDate(history.history);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
      <h2 className="mb-4 text-lg font-semibold">
        Historical Records ({history.period})
      </h2>
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
            {uniqueRecords.map((record, index) => {
              return (
                <tr key={index} className="transition-colors hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium whitespace-nowrap">
                    {formatDate(record.measured_at)}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {record.aqi || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {record.pm25 || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {record.pm10 || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {record.o3 || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {record.co || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {record.no2 || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    {record.so2 || '—'}
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <span className={getStatusBadge(record.category)}>
                      {formatCategoryLabel(record.category)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
