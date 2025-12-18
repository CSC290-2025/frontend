import useSummaryQuery from '@/features/clean-air/hooks/useSummary';
import { useParams } from '@/router';

export default function Summary() {
  const { district } = useParams('/clean-air/district-detail/:district');
  const { data: summary, isLoading, error } = useSummaryQuery(district);

  const containerClass =
    'h-full rounded-xl border border-gray-900 bg-white p-6 text-gray-900 shadow-2xl shadow-gray-400';

  if (isLoading || error || !summary) {
    return (
      <div className={containerClass}>
        <h2 className="mb-4 text-lg font-semibold">Week Summary</h2>
        <div className="flex h-40 items-center justify-center">
          {isLoading ? 'Loading...' : 'No data available'}
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
    { label: 'Highest AQI', value: summary.summary.maximum.aqi, unit: 'AQI' },
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
    <div className={containerClass}>
      <h2 className="mb-6 text-lg font-bold lg:text-xl lg:font-semibold">
        Week Summary
      </h2>

      <div className="grid grid-cols-3 gap-3 lg:gap-6">
        {summaryData.map((item, index) => (
          <div
            key={index}
            className="flex min-h-[110px] flex-col items-center justify-center rounded-lg border border-gray-500 bg-white px-2 py-4 text-center transition-all lg:min-h-[140px] lg:p-6"
          >
            <p className="text-2xl leading-none font-bold text-gray-900 lg:text-4xl lg:font-medium">
              {item.value}
            </p>

            {item.unit && (
              <p className="mt-1 text-[10px] font-bold tracking-widest text-gray-600 uppercase lg:text-[11px] lg:font-normal">
                {item.unit}
              </p>
            )}

            <p className="mt-2 text-[10px] leading-tight text-gray-500 lg:text-sm lg:font-normal">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
