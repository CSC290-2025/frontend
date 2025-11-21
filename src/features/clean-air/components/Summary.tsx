import useSummaryQuery from '@/features/clean-air/hooks/useSummary';
import { useParams } from '@/router';

export default function Summary() {
  const { district } = useParams('/clean-air/district-detail/:district');
  const { data: summary, isLoading, error } = useSummaryQuery(district);

  if (isLoading) {
    return (
      <div className="h-full rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
        <h2 className="mb-4 text-lg font-semibold">Week Summary</h2>
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-300 bg-gray-100 p-4 text-center"
            >
              <div className="animate-pulse">
                <div className="mb-2 h-8 rounded bg-gray-300"></div>
                <div className="mb-1 h-4 rounded bg-gray-300"></div>
                <div className="h-3 rounded bg-gray-300"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
        <h2 className="mb-4 text-lg font-semibold">Week Summary</h2>
        <div className="text-center text-red-500">
          <p>Error loading summary</p>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="h-full rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400">
        <h2 className="mb-4 text-lg font-semibold">Week Summary</h2>
        <div className="text-center text-gray-500">
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const summaryData = [
    {
      label: `Average AQI (${summary.period})`,
      value: summary.summary.average.aqi,
      unit: 'AQI',
    },
    {
      label: 'Highest AQI',
      value: summary.summary.maximum.aqi,
      unit: 'AQI',
    },
    {
      label: summary.summary.trend.description,
      value:
        summary.summary.trend.aqi_change > 0
          ? `+${summary.summary.trend.aqi_change}`
          : summary.summary.trend.aqi_change.toString(),
      unit: '',
    },
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
